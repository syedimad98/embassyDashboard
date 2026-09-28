export const reportCsvFields = [
  ['campaign', 'Campaign'],
  ['status', 'Status'],
  ['impressions', 'Impressions'],
  ['reach', 'Reach'],
  ['ctr', 'CTR %'],
  ['clicks', 'Clicks'],
  ['totalBudget', 'Total Budget'],
  ['totalSpend', 'Total Spend'],
]

export function createReportCsv(reports) {
  return [
    reportCsvFields.map(([, label]) => csvCell(label)).join(','),
    ...reports.map((row) => reportCsvFields.map(([key]) => csvCell(row[key] ?? '')).join(',')),
  ].join('\n')
}

function csvCell(value) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}