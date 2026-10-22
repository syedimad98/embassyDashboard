import { ApiError } from './apiError.js'
import { getDatabase } from './database.js'

const reportTypes = {
  summary: 'all',
  'video-ott': 'video-ott',
  daywise: 'day',
  sitewise: 'publisher',
  genderwise: 'gender',
  agewise: 'age',
}

function normalizePositiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10)
  return Number.isInteger(number) && number > 0 ? number : fallback
}

function matchesSearch(row, query, view) {
  if (!query) return true
  const searchableFields = {
    all: ['platform'],
    'video-ott': ['date'],
    day: ['date'],
    publisher: ['publisher'],
    gender: ['gender'],
    age: ['ageGroup'],
  }[view] ?? []

  return [row.campaign, ...searchableFields.map((field) => row[field])].some((value) =>
    String(value ?? '').toLowerCase().includes(query))
}

export async function getStoredReportData(type, { date = 'all', search = '', page = 1, pageSize = 5 } = {}) {
  const view = reportTypes[type]
  if (!view) throw new ApiError(404, 'REPORT_NOT_FOUND', 'The requested report does not exist.')

  const snapshot = await (await getDatabase())
    .collection('reportSnapshots')
    .findOne({ _id: view })

  if (!snapshot) {
    throw new ApiError(503, 'REPORTS_NOT_SEEDED', 'Report data is not initialized. Run npm run seed:reports.')
  }

  const query = typeof search === 'string' ? search.trim().toLowerCase() : ''
  const dateFilterApplies = view === 'day' || view === 'video-ott'
  const reports = snapshot.reports
    .filter((row) => !dateFilterApplies || date === 'all' || row.id === date)
    .filter((row) => matchesSearch(row, query, view))
  const total = !query && (!dateFilterApplies || date === 'all') ? snapshot.total ?? null : null
  const totalItems = reports.length

  if (pageSize === 'all') {
    return {
      view,
      reports,
      total,
      dates: snapshot.dates ?? [],
      pagination: { page: 1, pageSize: totalItems, totalItems, totalPages: 1 },
    }
  }

  const normalizedPageSize = Math.min(normalizePositiveInteger(pageSize, 5), 50)
  const totalPages = Math.max(1, Math.ceil(totalItems / normalizedPageSize))
  const normalizedPage = Math.min(normalizePositiveInteger(page, 1), totalPages)
  const start = (normalizedPage - 1) * normalizedPageSize

  return {
    view,
    reports: reports.slice(start, start + normalizedPageSize),
    total,
    dates: snapshot.dates ?? [],
    pagination: {
      page: normalizedPage,
      pageSize: normalizedPageSize,
      totalItems,
      totalPages,
    },
  }
}

export async function seedReportSnapshots(getReportData) {
  const database = await getDatabase()
  const collection = database.collection('reportSnapshots')
  const types = ['all', 'video-ott', 'day', 'publisher', 'gender', 'age']

  for (const type of types) {
    const data = getReportData({ view: type, pageSize: 'all' })
    await collection.updateOne(
      { _id: type },
      {
        $set: {
          reports: data.reports,
          total: data.total ?? null,
          dates: data.dates ?? [],
          updatedAt: new Date(),
          schemaVersion: 1,
        },
      },
      { upsert: true },
    )
  }
}
