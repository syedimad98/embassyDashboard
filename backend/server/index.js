import express from 'express'
import { adminExportHandler, adminReportHandler, loginHandler, respondWithApiError, signupHandler } from './apiHandlers.js'
import { getReportData } from './reportData.js'
import { createReportCsv } from './reportCsv.js'

const app = express()
const port = Number(process.env.PORT) || 3001
app.use(express.json({ limit: '16kb' }))

app.post('/api/auth/signup', async (request, response) => {
  const result = await signupHandler(request.body ?? {})
  response.status(result.statusCode).json(result.body)
})

app.post('/api/auth/login', async (request, response) => {
  const result = await loginHandler(request.body ?? {})
  response.status(result.statusCode).json(result.body)
})

const adminReportRoutes = {
  '/api/admin/campaign-summary': 'summary',
  '/api/admin/reports/video-ott': 'video-ott',
  '/api/admin/reports/daywise': 'daywise',
  '/api/admin/reports/sitewise': 'sitewise',
  '/api/admin/reports/genderwise': 'genderwise',
  '/api/admin/reports/agewise': 'agewise',
}

for (const [path, type] of Object.entries(adminReportRoutes)) {
  app.get(path, async (request, response) => {
    const result = await adminReportHandler(type, request.headers.authorization, request.query)
    response.status(result.statusCode).json(result.body)
  })
}

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

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/reports', (request, response) => {
  response.json(getReportData(request.query))
})

app.get('/api/reports/export.csv', (request, response) => {
  const { reports, total } = getReportData({ ...request.query, pageSize: 'all' })
  const exportRows = total ? [...reports, total] : reports
  response
    .type('text/csv')
    .attachment('audience-delivery-report.csv')
    .send(createReportCsv(exportRows, request.query.view))
})

app.use((error, _request, response, _next) => {
  const result = respondWithApiError(error)
  response.status(result.statusCode).json(result.body)
})

app.listen(port, () => {
  console.log(`Report API listening on http://localhost:${port}`)
})
