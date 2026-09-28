import express from 'express'
import { getReportData } from './reportData.js'

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
  const fields = [
    ['campaign', 'Campaign'],
    ['status', 'Status'],
    ['impressions', 'Impressions'],
    ['reach', 'Reach'],
    ['ctr', 'CTR %'],
    ['clicks', 'Clicks'],
    ['totalBudget', 'Total Budget'],
    ['totalSpend', 'Total Spend'],
  ]
  const csv = [
    fields.map(([, label]) => csvCell(label)).join(','),
    ...reports.map((row) => fields.map(([key]) => csvCell(row[key] ?? '')).join(',')),
  ].join('\n')

  response
    .type('text/csv')
    .attachment('audience-delivery-report.csv')
    .send(csv)
})

app.listen(port, () => {
  console.log(`Report API listening on http://localhost:${port}`)
})

function csvCell(value) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}