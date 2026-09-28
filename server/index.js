import express from 'express'
import { getReportData } from './reportData.js'
import { createReportCsv } from './reportCsv.js'

const app = express()
const port = Number(process.env.PORT) || 3001

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/reports', (request, response) => {
  response.json(getReportData(request.query))
})

app.get('/api/reports/export.csv', (request, response) => {
  const { reports } = getReportData(request.query)
  response
    .type('text/csv')
    .attachment('audience-delivery-report.csv')
    .send(createReportCsv(reports))
})

app.listen(port, () => {
  console.log(`Report API listening on http://localhost:${port}`)
})
