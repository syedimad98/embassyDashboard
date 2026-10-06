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
  ['totalAudience', 'Total Audience (TG & Geo)'],
  ['impressions', 'Impressions'],
  ['frequency', 'Freq'],
  ['reach', 'Reach'],
  ['reachPercent', 'Reach % of Total Audience'],
  ['ctr', 'CTR %'],
  ['clicks', 'Clicks'],
  ['cpc', 'Rate per unit (CPC)'],
  ['netCost', 'Net Cost (INR)'],
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

export const genderCsvFields = [
  ['campaign', 'Campaign'],
  ['gender', 'Gender'],
  ['impressions', 'Impression'],
  ['clicks', 'Click'],
  ['ctr', 'CTR'],
  ['reach', 'Reach'],
  ['spend', 'Spend'],
]

export const ageCsvFields = [
  ['campaign', 'Campaign'],
  ['ageGroup', 'Age group'],
  ['impressions', 'Impression'],
  ['clicks', 'Click'],
  ['ctr', 'CTR'],
  ['reach', 'Reach'],
  ['spend', 'Spend'],
]

export function createReportCsv(reports, view = 'all') {
  const fields = {
    all: allCsvFields,
    age: ageCsvFields,
    creator: creatorCsvFields,
    day: dayCsvFields,
    gender: genderCsvFields,
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