import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
import { getReportData, summaryRows } from './reportData.js'
import { createReportCsv } from './reportCsv.js'
import { getDatabase } from './database.js'

const app = express()
const port = Number(process.env.PORT) || 3002

app.use(express.json({ limit: '16kb' }))

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

// Central error handler
app.use((error, _request, response, _next) => {
  const result = respondWithApiError(error)
  response.status(result.statusCode).json(result.body)
})

app.listen(port, () => {
  console.log(`Report API listening on http://localhost:${port}`)
})