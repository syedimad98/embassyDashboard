import assert from 'node:assert/strict'
import test from 'node:test'
import jwt from 'jsonwebtoken'
import { adminReportHandler, parseRequestBody, respondWithApiError, signupHandler } from './apiHandlers.js'
import { ApiError } from './apiError.js'
import { handler as adminSummaryHandler } from '../netlify/functions/admin-summary.js'
import { handler as adOpsTemplateHandler } from '../netlify/functions/adops-template.js'
import { requireAdOps, requireAdmin } from './auth.js'
import { normalizeAdOpsCampaignRecord } from './adOpsCampaignRecord.js'
import ExcelJS from 'exceljs'
import { createAdOpsWorkbookTemplate, parseAdOpsWorkbook } from './adOpsWorkbook.js'

process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-bytes-long'

test('signup rejects public attempts to self-register as admin', async () => {
  await assert.rejects(
    signupHandler({ email: 'admin@example.com', password: 'long-password', registerAs: 'admin' }),
    (error) => error instanceof ApiError && error.statusCode === 400,
  )
})

test('signup rejects invalid email before database access', async () => {
  await assert.rejects(
    signupHandler({ email: 'not-an-email', password: 'short', registerAs: 'user' }),
    (error) => error instanceof ApiError && error.code === 'INVALID_EMAIL',
  )
})

test('request JSON parsing rejects malformed JSON', () => {
  assert.throws(
    () => parseRequestBody('{'),
    (error) => error instanceof ApiError && error.code === 'INVALID_JSON',
  )
})

test('admin report endpoints reject requests without a bearer token', async () => {
  await assert.rejects(
    adminReportHandler('summary', undefined, {}),
    (error) => error instanceof ApiError && error.statusCode === 401,
  )
})

test('standard-user tokens cannot access admin reports', async () => {
  const token = jwt.sign(
    { role: 'user', email: 'user@example.com' },
    process.env.JWT_SECRET,
    { subject: 'user-id', expiresIn: '1h' },
  )

  await assert.rejects(
    adminReportHandler('summary', `Bearer ${token}`, {}),
    (error) => error instanceof ApiError && error.statusCode === 403,
  )
})

test('ad-ops access accepts its own token', () => {
  const token = jwt.sign(
    { role: 'ad-ops', email: 'ops@example.com' },
    process.env.JWT_SECRET,
    { subject: 'ops-id', expiresIn: '1h' },
  )

  assert.equal(requireAdOps(`Bearer ${token}`).sub, 'ops-id')
})

test('ad-ops access rejects standard-user tokens', () => {
  const token = jwt.sign(
    { role: 'user', email: 'user@example.com' },
    process.env.JWT_SECRET,
    { subject: 'user-id', expiresIn: '1h' },
  )

  assert.throws(
    () => requireAdOps(`Bearer ${token}`),
    (error) => error instanceof ApiError && error.statusCode === 403,
  )
})

test('admin can read the Ad-ops campaign API when explicitly allowed', () => {
  const token = jwt.sign(
    { role: 'admin', email: 'admin@example.com' },
    process.env.JWT_SECRET,
    { subject: 'admin-id', expiresIn: '1h' },
  )

  assert.equal(requireAdOps(`Bearer ${token}`, { allowAdmin: true }).role, 'admin')
  assert.throws(
    () => requireAdOps(`Bearer ${token}`),
    (error) => error instanceof ApiError && error.statusCode === 403,
  )
})

test('only admins can manage user authorization access', () => {
  const adminToken = jwt.sign(
    { role: 'admin', email: 'admin@example.com' },
    process.env.JWT_SECRET,
    { subject: 'admin-id', expiresIn: '1h' },
  )
  const opsToken = jwt.sign(
    { role: 'ad-ops', email: 'ops@example.com' },
    process.env.JWT_SECRET,
    { subject: 'ops-id', expiresIn: '1h' },
  )

  assert.equal(requireAdmin(`Bearer ${adminToken}`).role, 'admin')
  assert.throws(
    () => requireAdmin(`Bearer ${opsToken}`),
    (error) => error instanceof ApiError && error.statusCode === 403,
  )
})

test('Ad-ops report submissions accept only fields for the selected report type', () => {
  assert.deepEqual(
    normalizeAdOpsCampaignRecord({
      reportType: 'day',
      date: '2026-10-27',
      impressions: '1200',
      clicks: '30',
      unexpectedField: 'ignored',
    }),
    {
      reportType: 'day',
      date: '2026-10-27',
      impressions: 1200,
      clicks: 30,
      ctr: null,
      reach: null,
      spend: null,
    },
  )
})

test('Ad-ops campaign submissions keep the existing campaign fields', () => {
  assert.deepEqual(
    normalizeAdOpsCampaignRecord({
      campaignName: '  Spring campaign  ',
      campaignTime: 'Monthly',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      impressionTarget: '1000',
    }),
    {
      campaignName: 'Spring campaign',
      campaignTime: 'Monthly',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      impressionTarget: 1000,
      clicksTarget: 0,
      reachTarget: 0,
      viewsTarget: 0,
    },
  )
})

test('Ad-ops report submissions validate report types and required fields', () => {
  assert.throws(
    () => normalizeAdOpsCampaignRecord({ reportType: 'unknown' }),
    (error) => error instanceof ApiError && error.code === 'INVALID_REPORT_TYPE',
  )
  assert.throws(
    () => normalizeAdOpsCampaignRecord({ reportType: 'publisher', impressions: 10 }),
    (error) => error instanceof ApiError && error.code === 'CAMPAIGN_FIELD_REQUIRED',
  )
})

test('Ad-ops Excel template round-trips summary and report-type rows', async () => {
  const buffer = await createAdOpsWorkbookTemplate()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const uploadSheet = workbook.getWorksheet('Upload Data')
  const instructions = workbook.getWorksheet('Instructions')
  const expectedInstructionSections = [
    ['Summary', 5, ['Campaign Name (required)', 'Campaign Time', 'Start Date', 'End Date']],
    ['Video-wise', 8, ['Date (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach', 'Views', 'Spend']],
    ['Day-wise', 11, ['Date (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach', 'Spend']],
    ['Gender-wise', 14, ['Gender (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach']],
    ['Age-wise', 17, ['Age Group (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach']],
    ['Publisher-wise', 20, ['Publisher (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach']],
    ['Creator-wise', 23, ['Campaign (required)', 'Creator (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach']],
  ]
  for (const [reportType, titleRow, fieldHeaders] of expectedInstructionSections) {
    assert.equal(instructions.getCell(titleRow, 1).value, reportType)
    assert.deepEqual(
      fieldHeaders.map((_, index) => instructions.getCell(titleRow + 1, index + 1).value),
      fieldHeaders,
    )
  }
  const expectedUploadSections = [
    ['Summary', 1, expectedInstructionSections[0][2]],
    ['Video-wise', 1003, expectedInstructionSections[1][2]],
    ['Day-wise', 2005, expectedInstructionSections[2][2]],
    ['Gender-wise', 3007, expectedInstructionSections[3][2]],
    ['Age-wise', 4009, expectedInstructionSections[4][2]],
    ['Publisher-wise', 5011, expectedInstructionSections[5][2]],
    ['Creator-wise', 6013, expectedInstructionSections[6][2]],
  ]
  for (const [reportType, titleRow, fieldHeaders] of expectedUploadSections) {
    assert.equal(uploadSheet.getCell(titleRow, 1).value, reportType)
    assert.deepEqual(
      fieldHeaders.map((_, index) => uploadSheet.getCell(titleRow + 1, index + 1).value),
      fieldHeaders,
    )
  }

  const summaryRow = uploadSheet.getRow(3)
  ;[
    'Spring campaign', 'Monthly', '2026-10-01', '2026-10-31',
    1000, 900, 50, 45, 4.5, 5, 800, 700, 200, 350, 500, 300,
  ].forEach((value, index) => {
    summaryRow.getCell(index + 1).value = value
  })

  const genderRow = uploadSheet.getRow(3009)
  ;['Female', 500, 20, 4, 400].forEach((value, index) => {
    genderRow.getCell(index + 1).value = value
  })

  const records = await parseAdOpsWorkbook(await workbook.xlsx.writeBuffer())
  assert.equal(records.length, 2)
  assert.equal(records[0].reportType, 'all')
  assert.equal(records[0].campaignName, 'Spring campaign')
  assert.equal(records[0].startDate, '2026-10-01')
  assert.equal(records[0].viewsDelivered, 350)
  assert.equal(records[1].reportType, 'gender')
  assert.equal(records[1].gender, 'Female')
  assert.equal(records[1].impressions, 500)
})

test('Ad-ops Excel upload rejects non-template workbooks and wrong report fields', async () => {
  const otherWorkbook = new ExcelJS.Workbook()
  otherWorkbook.addWorksheet('Campaigns').addRow(['Campaign'])
  await assert.rejects(
    parseAdOpsWorkbook(await otherWorkbook.xlsx.writeBuffer()),
    (error) => error instanceof ApiError && error.code === 'INVALID_TEMPLATE',
  )

  const templateBuffer = await createAdOpsWorkbookTemplate()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(templateBuffer)
  workbook.getWorksheet('Upload Data').getCell(2, 1).value = 'Date (wrong heading)'
  await assert.rejects(
    parseAdOpsWorkbook(await workbook.xlsx.writeBuffer()),
    (error) => error instanceof ApiError && error.code === 'INVALID_TEMPLATE_HEADERS',
  )
})

test('Ad-ops Excel upload rejects invalid summary date ranges', async () => {
  const buffer = await createAdOpsWorkbookTemplate()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const summaryRow = workbook.getWorksheet('Upload Data').getRow(3)
  summaryRow.getCell(1).value = 'Campaign'
  summaryRow.getCell(3).value = '2026-10-31'
  summaryRow.getCell(4).value = '2026-10-01'
  await assert.rejects(
    parseAdOpsWorkbook(await workbook.xlsx.writeBuffer()),
    (error) => error instanceof ApiError && error.code === 'INVALID_DATE_RANGE',
  )
})

test('Ad-ops Excel upload identifies an empty Upload Data sheet', async () => {
  const buffer = await createAdOpsWorkbookTemplate()
  await assert.rejects(
    parseAdOpsWorkbook(buffer),
    (error) => error instanceof ApiError
      && error.code === 'EMPTY_UPLOAD'
      && error.message.includes('The Instructions sheet is a guide only'),
  )
})

test('oversized Ad-ops uploads report the correct file size limit', () => {
  const result = respondWithApiError({ type: 'entity.too.large', limit: 5 * 1024 * 1024 })
  assert.equal(result.statusCode, 413)
  assert.equal(result.body.error.message, 'The Excel upload must not exceed 5 MB.')
})

test('Netlify admin function returns unauthorized without a token', async () => {
  const response = await adminSummaryHandler({ headers: {}, queryStringParameters: {} })
  assert.equal(response.statusCode, 401)
  assert.equal(JSON.parse(response.body).error.code, 'AUTHENTICATION_REQUIRED')
})

test('Netlify Ad-ops template function returns the Excel workbook for Ad-ops users', async () => {
  const token = jwt.sign(
    { role: 'ad-ops', email: 'ops@example.com' },
    process.env.JWT_SECRET,
    { subject: 'ops-id', expiresIn: '1h' },
  )

  const response = await adOpsTemplateHandler({
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 200)
  assert.equal(response.isBase64Encoded, true)
  assert.equal(response.headers['content-type'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  assert.match(response.headers['content-disposition'], /adops-template\.xlsx/)

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(Buffer.from(response.body, 'base64'))
  assert.equal(workbook.getWorksheet('Instructions').getCell('A1').value, 'ADOPS_TEMPLATE_V2')
})
