export const dayCsvFields = [
  ['campaign', 'Campaign'],
  ['date', 'Date'],
  ['impressions', 'Impressions'],
  ['clicks', 'Clicks'],
  ['ctr', 'CTR %'],
  ['reach', 'Reach'],
  ['spend', 'Spend'],
]

export const allCsvFields = [
  ['campaign', 'Campaign'],
  ['status', 'Status'],
  ['impressions', 'Impressions'],
  ['reach', 'Reach'],
  ['ctr', 'CTR %'],
  ['clicks', 'Clicks'],
  ['totalBudget', 'Total Budget'],
  ['totalSpend', 'Total Spend'],
]

export const publisherCsvFields = [
  ['campaign', 'Campaign'],
  ['publisher', 'Publisher'],
  ['impressions', 'Impressions'],
  ['clicks', 'Clicks'],
  ['ctr', 'CTR %'],
  ['reach', 'Reach'],
]

export const creatorCsvFields = [
  ['campaign', 'Campaign'],
  ['creator', 'Creator'],
  ['impressions', 'Impressions'],
  ['clicks', 'Clicks'],
  ['ctr', 'CTR %'],
  ['reach', 'Reach'],
]

export function createReportCsv(reports, view = 'all') {
  const fields = {
    all: allCsvFields,
    creator: creatorCsvFields,
    day: dayCsvFields,
    publisher: publisherCsvFields,
  }[view] ?? allCsvFields

  return [
    fields.map(([, label]) => csvCell(label)).join(','),
    ...reports.map((row) => fields.map(([key]) => csvCell(row[key] ?? '')).join(',')),
  ].join('\n')
}

function csvCell(value) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}