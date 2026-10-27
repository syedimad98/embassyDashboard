import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'
import { ObjectId } from 'mongodb'

const currentFile = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFile)

dotenv.config({
  path: path.resolve(currentDirectory, '../../.env'),
})

import express from 'express'
import {
  adminExportHandler,
  adminReportHandler,
  loginHandler,
  respondWithApiError,
  signupHandler,
} from './apiHandlers.js'
import { ApiError } from './apiError.js'
import { getReportData, summaryRows } from './reportData.js'
import { createReportCsv } from './reportCsv.js'
import { getDatabase } from './database.js'
import { ObjectId } from 'mongodb'
import { requireAdmin, requireAdOps } from './auth.js'
import { normalizeAdOpsCampaignRecord } from './adOpsCampaignRecord.js'
import {
  adOpsWorkbookMimeType,
  adOpsWorkbookMaxRows,
  createAdOpsWorkbookTemplate,
  parseAdOpsWorkbook,
} from './adOpsWorkbook.js'

const app = express()
const port = Number(process.env.PORT) || 3003

app.use(express.json({ limit: '16kb' }))

function serializeAdOpsCampaign(campaign) {
  const { _id, ...fields } = campaign
  return { ...fields, id: String(_id) }
}

function getAdOpsCampaignFilter(user, id) {
  const filter = user.role === 'admin' ? {} : { ownerId: user.sub }
  if (!id) return filter
  if (!ObjectId.isValid(id)) {
    throw new ApiError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign was not found.')
  }
  return { ...filter, _id: new ObjectId(id) }
}

function serializeClient(client) {
  return {
    id: String(client._id),
    name: client.name,
    email: client.email,
  }
}

app.get('/api/admin/user-access', async (request, response, next) => {
  try {
    requireAdmin(request.headers.authorization)
    const database = await getDatabase()
    const [users, clients] = await Promise.all([
      database.collection('users')
        .find({ role: 'ad-ops' }, { projection: { email: 1, clientAccess: 1 } })
        .sort({ email: 1 })
        .toArray(),
      database.collection('clients')
        .find({}, { projection: { name: 1, email: 1 } })
        .sort({ name: 1 })
        .toArray(),
    ])
    response.json({
      users: users.map((user) => ({
        id: String(user._id),
        email: user.email,
        allClients: user.clientAccess?.allClients === true,
        clientIds: (user.clientAccess?.clientIds || []).map(String),
      })),
      clients: clients.map(serializeClient),
    })
  } catch (error) {
    next(error)
  }
})

app.put('/api/admin/user-access/:userId', async (request, response, next) => {
  try {
    requireAdmin(request.headers.authorization)
    const { userId } = request.params
    const { allClients = false, clientIds = [] } = request.body ?? {}
    if (!ObjectId.isValid(userId)) {
      throw new ApiError(400, 'INVALID_USER_ID', 'A valid Ad-ops user ID is required.')
    }
    if (typeof allClients !== 'boolean' || !Array.isArray(clientIds) || clientIds.some((id) => typeof id !== 'string' || !ObjectId.isValid(id))) {
      throw new ApiError(400, 'INVALID_CLIENT_ACCESS', 'Client access must contain a valid all-clients choice and client IDs.')
    }

    const uniqueClientIds = [...new Set(clientIds)]
    const database = await getDatabase()
    const users = database.collection('users')
    const user = await users.findOne({ _id: new ObjectId(userId), role: 'ad-ops' }, { projection: { _id: 1 } })
    if (!user) throw new ApiError(404, 'AD_OPS_USER_NOT_FOUND', 'Ad-ops user was not found.')

    if (!allClients && uniqueClientIds.length) {
      const clients = await database.collection('clients')
        .find({ _id: { $in: uniqueClientIds.map((id) => new ObjectId(id)) } }, { projection: { _id: 1 } })
        .toArray()
      if (clients.length !== uniqueClientIds.length) {
        throw new ApiError(400, 'INVALID_CLIENT_ACCESS', 'One or more selected clients were not found.')
      }
    }

    const clientAccess = {
      allClients,
      clientIds: allClients ? [] : uniqueClientIds,
    }
    await users.updateOne({ _id: new ObjectId(userId), role: 'ad-ops' }, { $set: { clientAccess } })
    response.json({ userId, clientAccess })
  } catch (error) {
    next(error)
  }
})

app.get('/api/ad-ops/clients', async (request, response, next) => {
  try {
    const user = requireAdOps(request.headers.authorization, { allowAdmin: true })
    const database = await getDatabase()
    let filter = {}

    if (user.role !== 'admin') {
      const account = await database.collection('users').findOne(
        { _id: new ObjectId(user.sub), role: 'ad-ops' },
        { projection: { clientAccess: 1 } },
      )
      if (!account?.clientAccess?.allClients) {
        const clientIds = account?.clientAccess?.clientIds || []
        filter = clientIds.length
          ? { _id: { $in: clientIds.map((id) => new ObjectId(id)) } }
          : { _id: { $exists: false } }
      }
    }

    const clients = await database.collection('clients')
      .find(filter, { projection: { name: 1, email: 1, address: 1 } })
      .sort({ name: 1 })
      .toArray()
    response.json(clients.map(serializeClient))
  } catch (error) {
    next(error)
  }
})

app.get('/api/ad-ops/campaigns/template.xlsx', async (request, response, next) => {
  try {
    requireAdOps(request.headers.authorization)
    const workbook = await createAdOpsWorkbookTemplate()
    response
      .type(adOpsWorkbookMimeType)
      .attachment('adops-template.xlsx')
      .send(Buffer.from(workbook))
  } catch (error) {
    next(error)
  }
})

app.post(
  '/api/ad-ops/campaigns/bulk-upload',
  express.raw({ type: adOpsWorkbookMimeType, limit: '5mb' }),
  async (request, response, next) => {
    try {
      const user = requireAdOps(request.headers.authorization)
      if (!Buffer.isBuffer(request.body)) {
        throw new ApiError(415, 'EXCEL_FILE_REQUIRED', 'Upload the downloaded .xlsx template file.')
      }
      if (request.body.length === 0) {
        throw new ApiError(400, 'EMPTY_UPLOAD', 'Select a non-empty Excel template file.')
      }

      const records = await parseAdOpsWorkbook(request.body)
      if (records.length > adOpsWorkbookMaxRows) {
        throw new ApiError(400, 'TOO_MANY_ROWS', `A maximum of ${adOpsWorkbookMaxRows} rows can be uploaded at once.`)
      }
      const createdAt = new Date()
      const documents = records.map((record) => ({
        ...record,
        ownerId: user.sub,
        createdAt,
        updatedAt: createdAt,
      }))
      const result = await (await getDatabase())
        .collection('adOpsCampaigns')
        .insertMany(documents, { ordered: true })

      response.status(201).json({
        message: `${result.insertedCount} row${result.insertedCount === 1 ? '' : 's'} uploaded successfully.`,
        insertedCount: result.insertedCount,
      })
    } catch (error) {
      next(error)
    }
  },
)

app.get('/api/ad-ops/campaigns', async (request, response, next) => {
  try {
    const user = requireAdOps(request.headers.authorization, { allowAdmin: true })
    const database = await getDatabase()
    const campaigns = await database
      .collection('adOpsCampaigns')
      .find(getAdOpsCampaignFilter(user))
      .sort({ createdAt: 1 })
      .toArray()
    response.json(campaigns.map(serializeAdOpsCampaign))
  } catch (error) {
    next(error)
  }
})

app.post('/api/ad-ops/campaigns', async (request, response, next) => {
  try {
    const user = requireAdOps(request.headers.authorization)
    const record = {
      ...normalizeAdOpsCampaignRecord(request.body ?? {}),
      ownerId: user.sub,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const database = await getDatabase()
    const result = await database.collection('adOpsCampaigns').insertOne(record)
    response.status(201).json(serializeAdOpsCampaign({ ...record, _id: result.insertedId }))
  } catch (error) {
    next(error)
  }
})

app.put('/api/ad-ops/campaigns/:id', async (request, response, next) => {
  try {
    const user = requireAdOps(request.headers.authorization)
    const database = await getDatabase()
    const campaigns = database.collection('adOpsCampaigns')
    const filter = getAdOpsCampaignFilter(user, request.params.id)
    const record = {
      ...normalizeAdOpsCampaignRecord(request.body ?? {}),
      updatedAt: new Date(),
    }
    const result = await campaigns.findOneAndUpdate(
      filter,
      { $set: record },
      { returnDocument: 'after' },
    )
    if (!result) {
      response.status(404).json({ message: 'Campaign was not found.' })
      return
    }
    response.json(serializeAdOpsCampaign(result))
  } catch (error) {
    next(error)
  }
})

// Signup
app.post('/api/auth/signup', async (request, response) => {
  const result = await signupHandler(request.body ?? {})
  response.status(result.statusCode).json(result.body)
})

// Login
app.post('/api/auth/login', async (request, response) => {
  const result = await loginHandler(request.body ?? {})
  response.status(result.statusCode).json(result.body)
})

// Admin report endpoints
const adminReportRoutes = {
  '/api/admin/campaign-summary': 'summary',
  '/api/admin/reports/video-ott': 'video-ott',
  '/api/admin/reports/daywise': 'daywise',
  '/api/admin/reports/sitewise': 'sitewise',
  '/api/admin/reports/genderwise': 'genderwise',
  '/api/admin/reports/agewise': 'agewise',
}

for (const [routePath, type] of Object.entries(adminReportRoutes)) {
  app.get(routePath, async (request, response) => {
    const result = await adminReportHandler(
      type,
      request.headers.authorization,
      request.query,
    )

    response.status(result.statusCode).json(result.body)
  })
}

// Admin CSV export
app.get('/api/admin/reports/:type/export.csv', async (request, response) => {
  const result = await adminExportHandler(
    request.params.type,
    request.headers.authorization,
    request.query,
    createReportCsv,
  )

  response
    .status(result.statusCode)
    .type(result.contentType)
    .attachment('audience-delivery-report.csv')
    .send(result.body)
})

// Health check
app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

// Load report data, including campaigns uploaded by Admin.
app.get('/api/reports', async (request, response, next) => {
  try {
    let extraSummaryRows = []

    if (!request.query.view || request.query.view === 'all') {
      try {
        const database = await getDatabase()

        const savedCampaigns = await database
          .collection('campaigns')
          .find({})
          .sort({ createdAt: 1 })
          .toArray()

        extraSummaryRows = savedCampaigns.map((campaign) => ({
          id: String(campaign._id),
          platform: campaign.campaignName,
          reportTill:
            campaign.campaignTime ||
            campaign.endDate ||
            campaign.startDate ||
            '—',
          impressionTarget: Number(campaign.impressionTarget) || 0,
          impressionDelivered: 0,
          clicksTarget: Number(campaign.clicksTarget) || 0,
          clicksDelivered: 0,
          actualCtr: 0,
          deliveredCtr: 0,
          reachTarget: Number(campaign.reachTarget) || 0,
          reachDelivered: 0,
          viewsTarget: Number(campaign.viewsTarget) || 0,
          viewsDelivered: 0,
          totalBudget: 0,
          totalSpend: 0,
        }))
      } catch (error) {
        // Keep existing sample reports available if MongoDB is unavailable.
        console.warn(
          'Could not load saved campaigns for report:',
          error.message,
        )
      }
    }

    const reportData = getReportData({
      ...request.query,
      extraSummaryRows,
    })

    response.json(reportData)
  } catch (error) {
    next(error)
  }
})

// Return existing sample campaigns plus campaigns saved by Admin.
app.get('/api/campaigns', async (_request, response, next) => {
  try {

const existingCampaigns = summaryRows.map((row) => ({
  id: row.id,
  platform: row.platform,
  campaignName: row.platform,
  reportTill: row.reportTill,
  campaignTime: row.reportTill,
  campaignType: row.campaignType ?? '',
  startDate: row.startDate ?? '',
  endDate: row.endDate ?? '',
  impressionTarget: row.impressionTarget,
  impressionDelivered: row.impressionDelivered,
  clicksTarget: row.clicksTarget,
  clicksDelivered: row.clicksDelivered,
  actualCtr: row.actualCtr,
  deliveredCtr: row.deliveredCtr,
  reachTarget: row.reachTarget,
  reachDelivered: row.reachDelivered,
  viewsTarget: row.viewsTarget,
  viewsDelivered: row.viewsDelivered,
  totalBudget: row.totalBudget,
  totalSpend: row.totalSpend,
}))

    try {
      const database = await getDatabase()

      const savedCampaigns = await database
        .collection('campaigns')
        .find({})
        .sort({ createdAt: 1 })
        .toArray()

      response.json([
        ...existingCampaigns,
        ...savedCampaigns.map((campaign) => ({
          ...campaign,
          id: String(campaign._id),
        })),
      ])
    } catch (error) {
      if (error.message?.includes('MongoDB is not configured')) {
        response.json(existingCampaigns)
        return
      }

      throw error
    }
  } catch (error) {
    next(error)
  }
})

// Save a campaign uploaded by Admin.
app.post('/api/campaigns', async (request, response, next) => {
  try {
    const body = request.body ?? {}
    const campaignName = String(body.campaignName ?? '').trim()

    if (!campaignName) {
      response.status(400).json({
        message: 'Campaign name is required.',
      })
      return
    }

    const record = {
      campaignName,
      campaignTime: String(body.campaignTime ?? '').trim(),
      startDate: String(body.startDate ?? ''),
      endDate: String(body.endDate ?? ''),
      impressionTarget: Math.max(
        0,
        Number(body.impressionTarget) || 0,
      ),
      clicksTarget: Math.max(
        0,
        Number(body.clicksTarget) || 0,
      ),
      reachTarget: Math.max(
        0,
        Number(body.reachTarget) || 0,
      ),
      viewsTarget: Math.max(
        0,
        Number(body.viewsTarget) || 0,
      ),
      createdAt: new Date(),
    }

    const database = await getDatabase()
    const result = await database
      .collection('campaigns')
      .insertOne(record)

    response.status(201).json({
      ...record,
      id: String(result.insertedId),
      _id: result.insertedId,
    })
  } catch (error) {
    next(error)
  }
})


/**
 * Save client details in MongoDB.
 * POST /api/clients
 */
app.post('/api/clients', async (request, response, next) => {
  try {
    const body = request.body ?? {}

    const name = String(body.name ?? '').trim()
    const address = String(body.address ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const phoneNo = String(body.phoneNo ?? '').trim()

    // Validate required fields.
    if (!name || !address || !email || !phoneNo) {
      response.status(400).json({
        message: 'Name, address, email, and phone number are required.',
      })
      return
    }

    // Basic email validation.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(email)) {
      response.status(400).json({
        message: 'Please provide a valid email address.',
      })
      return
    }

    // Prevent excessively long values.
    if (
      name.length > 150 ||
      address.length > 500 ||
      email.length > 254 ||
      phoneNo.length > 30
    ) {
      response.status(400).json({
        message: 'One or more client details exceed the allowed length.',
      })
      return
    }

    const record = {
      name,
      address,
      email,
      phoneNo,
      createdAt: new Date(),
    }

    const database = await getDatabase()
    const result = await database.collection('clients').insertOne(record)

    response.status(201).json({
      message: 'Client details saved successfully.',
      client: {
        ...record,
        id: String(result.insertedId),
        _id: result.insertedId,
      },
    })
  } catch (error) {
    next(error)
  }
})


// CSV export
app.get('/api/reports/export.csv', (request, response) => {
  const { reports, total } = getReportData({
    ...request.query,
    pageSize: 'all',
  })

  const exportRows = total ? [...reports, total] : reports

  response
    .type('text/csv')
    .attachment('audience-delivery-report.csv')
    .send(createReportCsv(exportRows, request.query.view))
})


const screenshotUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
    files: 10,                 // Maximum 10 images per request
  },
  fileFilter: (_request, file, callback) => {
    const allowedTypes = ['image/jpeg', 'image/png']

    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Only JPG and PNG images are allowed.')
      error.statusCode = 400
      return callback(error)
    }

    callback(null, true)
  },
})

// GET: Fetch uploaded screenshots from MongoDB.
app.get('/api/screenshots', async (_request, response, next) => {
  try {
    const database = await getDatabase()

    const screenshots = await database
      .collection('screenshots')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    response.json({
      screenshots: screenshots.map((image) => ({
        id: String(image._id),
        filename: image.filename,
        mimetype: image.mimetype,
        size: image.size,
        createdAt: image.createdAt,
        imageUrl: `data:${image.mimetype};base64,${image.data.toString('base64')}`,
      })),
    })
  } catch (error) {
    next(error)
  }
})

// POST: Upload screenshots and save them in MongoDB.
app.post(
  '/api/screenshots',
  screenshotUpload.array('screenshots', 10),
  async (request, response, next) => {
    try {
      const files = request.files ?? []

      if (files.length === 0) {
        response.status(400).json({
          message: 'Please select at least one JPG or PNG image.',
        })
        return
      }

      const database = await getDatabase()

      const records = files.map((file) => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer,
        createdAt: new Date(),
      }))

      const result = await database
        .collection('screenshots')
        .insertMany(records)

      response.status(201).json({
        message: 'Screenshots uploaded successfully.',
        uploadedCount: result.insertedCount,
      })
    } catch (error) {
      next(error)
    }
  },
)

app.delete('/api/screenshots/:id', async (request, response, next) => {
  try {
    const { id } = request.params

    if (!ObjectId.isValid(id)) {
      return response.status(400).json({
        message: 'Invalid screenshot ID.',
      })
    }

    const database = await getDatabase()

    const result = await database.collection('screenshots').deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return response.status(404).json({
        message: 'Screenshot not found.',
      })
    }

    return response.json({
      message: 'Screenshot deleted successfully.',
    })
  } catch (error) {
    next(error)
  }
})


// Central error handler
app.use((error, _request, response, _next) => {
  const result = respondWithApiError(error)
  response.status(result.statusCode).json(result.body)
})

app.listen(port, () => {
  console.log(`Report API listening on http://localhost:${port}`)
})