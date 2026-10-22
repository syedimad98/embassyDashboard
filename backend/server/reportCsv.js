export const dayCsvFields = [
  ['date', 'Date'],
  ['impressions', 'Impression'],
  ['clicks', 'Click'],
  ['ctr', 'CTR'],
  ['reach', 'Reach'],
  ['spend', 'Spend'],
]

export const videoCsvFields = [
  ['date', 'Date'],
  ['impressions', 'Impression'],
  ['clicks', 'Click'],
  ['ctr', 'CTR'],
  ['reach', 'Reach'],
  ['views', 'Views'],
  ['spend', 'Spend'],
]

export const allCsvFields = [
  ['platform', 'Platform'],
  ['reportTill', 'Report till'],
  ['impressionTarget', 'Impression target'],
  ['impressionDelivered', 'Impression delivered'],
  ['clicksTarget', 'Clicks target'],
  ['clicksDelivered', 'Clicks delivered'],
  ['actualCtr', 'Actual CTR'],
  ['deliveredCtr', 'Delivered CTR'],
  ['reachTarget', 'Reach target'],
  ['reachDelivered', 'Reach delivered'],
  ['viewsTarget', 'Views target'],
  ['viewsDelivered', 'Views delivered'],
  ['totalBudget', 'Total Budget'],
  ['totalSpend', 'Total Spend'],
]

export const publisherCsvFields = [
  ['publisher', 'Publisher'],
  ['impressions', 'Impression'],
  ['clicks', 'Clicks'],
  ['ctr', 'CTR'],
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
  ['gender', 'Gender'],
  ['impressions', 'Impression'],
  ['clicks', 'Click'],
  ['ctr', 'CTR'],
  ['reach', 'Reach'],
]

export const ageCsvFields = [
  ['ageGroup', 'Age group'],
  ['impressions', 'Impression'],
  ['clicks', 'Click'],
  ['ctr', 'CTR'],
  ['reach', 'Reach'],
]

export function createReportCsv(reports, view = 'all') {
  const fields = {
    all: allCsvFields,
    age: ageCsvFields,
    creator: creatorCsvFields,
    day: dayCsvFields,
    gender: genderCsvFields,
    publisher: publisherCsvFields,
    'video-ott': videoCsvFields,
  }[view] ?? allCsvFields

  return [
    fields.map(([, label]) => csvCell(label)).join(','),
    ...reports.map((row) => fields.map(([key]) => {
      const value = view === 'video-ott' && key === 'spend' && row[key] != null
        ? row[key].toFixed(2)
        : row[key] ?? ''
      return csvCell(value)
    }).join(',')),
  ].join('\n')
}

function csvCell(value) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}