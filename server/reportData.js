export const campaignName = 'Embassy - Programmatic'

export const summaryRows = [
  {
    id: 'embassy-static-display',
    platform: 'Embassy - Static Display Programmatic',
    reportTill: '30 Sept',
    impressionTarget: 6000000,
    impressionDelivered: 6002921,
    clicksTarget: 30000,
    clicksDelivered: 30356,
    actualCtr: 0.5,
    deliveredCtr: 0.51,
    reachTarget: 2000000,
    reachDelivered: 2064118,
    viewsTarget: null,
    viewsDelivered: null,
    totalBudget: 300000,
    totalSpend: 303560,
  },
  {
    id: 'embassy-jiohotstar-ott',
    platform: 'Embassy - Jiohotstar OTT',
    reportTill: '5th Oct',
    impressionTarget: 3333333,
    impressionDelivered: 1004871,
    clicksTarget: 9999,
    clicksDelivered: 3149,
    actualCtr: 0.3,
    deliveredCtr: 0.31,
    reachTarget: 833333,
    reachDelivered: 254038,
    viewsTarget: 2000000,
    viewsDelivered: 627695,
    totalBudget: 600000,
    totalSpend: 188309,
  },
]

export const reportRows = [
  { id: '22-sep', date: '22 Sep', impressions: 470042, clicks: 2432, ctr: 0.52, reach: 149967, spend: 24320 },
  { id: '23-sep', date: '23 Sep', impressions: 696945, clicks: 3422, ctr: 0.49, reach: 240965, spend: 34220 },
  { id: '24-sep', date: '24 Sep', impressions: 456899, clicks: 2417, ctr: 0.53, reach: 163696, spend: 24170 },
  { id: '25-sep', date: '25 Sep', impressions: 534262, clicks: 2721, ctr: 0.51, reach: 176253, spend: 27210 },
  { id: '26-sep', date: '26 Sep', impressions: 703317, clicks: 3371, ctr: 0.48, reach: 241082, spend: 33710 },
  { id: '27-sep', date: '27 Sep', impressions: 789242, clicks: 4138, ctr: 0.52, reach: 257922, spend: 41380 },
  { id: '28-sep', date: '28 Sep', impressions: 557627, clicks: 2961, ctr: 0.53, reach: 203520, spend: 29610 },
  { id: '29-sep', date: '29 Sep', impressions: 867370, clicks: 4519, ctr: 0.52, reach: 306512, spend: 45190 },
  { id: '30-sep', date: '30 Sep', impressions: 927217, clicks: 4375, ctr: 0.47, reach: 324201, spend: 43750 },
]

export const videoRows = [
  { id: '1-oct', date: '1 Oct', impressions: 67654, clicks: 221, ctr: 0.33, reach: 17513, views: 40924, spend: 12277.20 },
  { id: '2-oct', date: '2 Oct', impressions: 130355, clicks: 429, ctr: 0.33, reach: 32736, views: 81645, spend: 24493.50 },
  { id: '3-oct', date: '3 Oct', impressions: 201320, clicks: 610, ctr: 0.30, reach: 50748, views: 127099, spend: 38129.70 },
  { id: '4-oct', date: '4 Oct', impressions: 251566, clicks: 803, ctr: 0.32, reach: 64284, views: 156534, spend: 46960.20 },
  { id: '5-oct', date: '5 Oct', impressions: 353976, clicks: 1086, ctr: 0.31, reach: 88757, views: 221493, spend: 66447.90 },
  ...Array.from({ length: 7 }, (_, index) => ({
    id: `${6 + index}-oct`,
    date: `${6 + index} Oct`,
    impressions: null,
    clicks: null,
    ctr: null,
    reach: null,
    views: null,
    spend: null,
  })),
]

function sumReportField(rows, field) {
  return rows.reduce((total, row) => total + (row[field] ?? 0), 0)
}

function sumMoneyField(rows) {
  const cents = rows.reduce((total, row) => total + Math.round((row.spend ?? 0) * 100), 0)
  return Number((cents / 100).toFixed(2))
}

function createDailyTotal(rows, id, includeViews = false) {
  const impressions = sumReportField(rows, 'impressions')
  const clicks = sumReportField(rows, 'clicks')

  return {
    id,
    date: 'Total',
    impressions,
    clicks,
    ctr: Number(((clicks / impressions) * 100).toFixed(2)),
    reach: sumReportField(rows, 'reach'),
    ...(includeViews ? { views: sumReportField(rows, 'views') } : {}),
    spend: sumMoneyField(rows),
  }
}

export const dayTotal = createDailyTotal(reportRows, 'day-total')
export const videoTotal = createDailyTotal(videoRows, 'video-total', true)

export const genderRows = [
  { id: 'male', gender: 'Male', impressions: 3730815, clicks: 19394, ctr: 0.52, reach: 1355506 },
  { id: 'female', gender: 'Female', impressions: 2272106, clicks: 10962, ctr: 0.48, reach: 708612 },
]

export const ageRows = [
  { id: '25-34', ageGroup: '25-34', impressions: 1287026, clicks: 5982, ctr: 0.46, reach: 431195 },
  { id: '35-45', ageGroup: '35-45', impressions: 2741534, clicks: 14530, ctr: 0.53, reach: 969516 },
  { id: '46-50', ageGroup: '46-50', impressions: 1974361, clicks: 9844, ctr: 0.50, reach: 663407 },
]

function createDemographicTotal(rows, id, labelKey) {
  const impressions = rows.reduce((total, row) => total + row.impressions, 0)
  const clicks = rows.reduce((total, row) => total + row.clicks, 0)

  return {
    id,
    [labelKey]: 'Total',
    impressions,
    clicks,
    ctr: Number(((clicks / impressions) * 100).toFixed(2)),
    reach: rows.reduce((total, row) => total + row.reach, 0),
  }
}

export const genderTotal = {
  ...createDemographicTotal(genderRows, 'gender-total', 'gender'),
  ctr: 0.51,
}

export const ageTotal = createDemographicTotal(ageRows, 'age-total', 'ageGroup')

export const publisherRows = [
  { id: 'udayavani', publisher: 'Udayavani', impressions: 317811, clicks: 1828, ctr: 0.58, reach: 108199 },
  { id: 'economic-times-markets', publisher: 'The Economic Times – Markets', impressions: 176515, clicks: 961, ctr: 0.54, reach: 61340 },
  { id: 'lifestyle-asia-india', publisher: 'Lifestyle Asia India', impressions: 173321, clicks: 769, ctr: 0.44, reach: 59299 },
  { id: 'trade-brains', publisher: 'Trade Brains', impressions: 182207, clicks: 883, ctr: 0.48, reach: 62643 },
  { id: 'vijaya-karnataka', publisher: 'Vijaya Karnataka', impressions: 335219, clicks: 1937, ctr: 0.58, reach: 116317 },
  { id: 'financial-express', publisher: 'Financial Express', impressions: 178108, clicks: 935, ctr: 0.52, reach: 61475 },
  { id: 'reuters-india', publisher: 'Reuters India / Reuters.com', impressions: 180019, clicks: 913, ctr: 0.51, reach: 62520 },
  { id: 'prajavani', publisher: 'Prajavani', impressions: 327814, clicks: 1894, ctr: 0.58, reach: 112655 },
  { id: 'entrepreneur-india', publisher: 'Entrepreneur India', impressions: 161288, clicks: 677, ctr: 0.42, reach: 55492 },
  { id: 'gq-india', publisher: 'GQ India', impressions: 180522, clicks: 828, ctr: 0.46, reach: 63101 },
  { id: 'indian-express-lifestyle', publisher: 'Indian Express Lifestyle', impressions: 166312, clicks: 714, ctr: 0.43, reach: 57531 },
  { id: 'tv9-kannada', publisher: 'TV9 Kannada', impressions: 306888, clicks: 1738, ctr: 0.57, reach: 103864 },
  { id: 'homegrown-india', publisher: 'Homegrown India', impressions: 163835, clicks: 695, ctr: 0.42, reach: 57824 },
  { id: 'kannada-prabha', publisher: 'Kannada Prabha', impressions: 295953, clicks: 1653, ctr: 0.56, reach: 101555 },
  { id: 'india-today-lifestyle', publisher: 'India Today Lifestyle', impressions: 168715, clicks: 732, ctr: 0.43, reach: 58334 },
  { id: 'goodreturns', publisher: 'Goodreturns', impressions: 181694, clicks: 891, ctr: 0.49, reach: 62071 },
  { id: 'times-of-india-lifestyle', publisher: 'Times of India Lifestyle', impressions: 171051, clicks: 752, ctr: 0.44, reach: 59501 },
  { id: 'business-today', publisher: 'Business Today', impressions: 179413, clicks: 918, ctr: 0.51, reach: 59973 },
  { id: 'moneycontrol', publisher: 'Moneycontrol', impressions: 175635, clicks: 968, ctr: 0.55, reach: 61244 },
  { id: 'mans-world-india', publisher: 'Man’s World India', impressions: 178463, clicks: 809, ctr: 0.45, reach: 60229 },
  { id: 'mensxp', publisher: 'MensXP', impressions: 182507, clicks: 846, ctr: 0.46, reach: 62141 },
  { id: 'esquire-india', publisher: 'Esquire India', impressions: 175523, clicks: 787, ctr: 0.45, reach: 58528 },
  { id: 'cnbc-tv18', publisher: 'CNBC-TV18', impressions: 176644, clicks: 950, ctr: 0.54, reach: 60014 },
  { id: 'business-insider', publisher: 'Business Insider', impressions: 183649, clicks: 861, ctr: 0.47, reach: 65454 },
  { id: 'hindu-businessline', publisher: 'The Hindu BusinessLine', impressions: 178777, clicks: 928, ctr: 0.52, reach: 62716 },
  { id: 'marketwatch', publisher: 'MarketWatch', impressions: 182703, clicks: 876, ctr: 0.48, reach: 64051 },
  { id: 'business-standard', publisher: 'Business Standard', impressions: 177398, clicks: 942, ctr: 0.53, reach: 61637 },
  { id: 'bloomberg', publisher: 'Bloomberg', impressions: 180599, clicks: 905, ctr: 0.50, reach: 61122 },
  { id: 'forbes-india', publisher: 'Forbes India', impressions: 181159, clicks: 898, ctr: 0.50, reach: 60725 },
  { id: 'nasdaq', publisher: 'Nasdaq', impressions: 183179, clicks: 868, ctr: 0.47, reach: 62563 },
]

export function getReportData({ view = 'all', date = 'all', search = '', page = 1, pageSize = 5 } = {}) {
  const query = search.trim().toLowerCase()

  if (view === 'video-ott') {
    const dateReports = date === 'all'
      ? videoRows
      : videoRows.filter((row) => row.id === date)
    return createResponse({
      view,
      reports: filterBySearch(dateReports, query, 'date'),
      total: date === 'all' && !query ? videoTotal : null,
      dates: createDateOptions(videoRows),
      page,
      pageSize,
    })
  }

  if (view === 'all') {
    return createResponse({
      view,
      reports: filterBySearch(summaryRows, query, 'platform'),
      dates: createDateOptions(),
      page,
      pageSize,
    })
  }

  if (view === 'creator') {
    return createResponse({
      view,
      reports: [],
      dates: createDateOptions(),
      page,
      pageSize,
    })
  }

  if (view === 'publisher') {
    const publisherReports = addCampaign(publisherRows)

    return createResponse({
      view,
      reports: filterBySearch(publisherReports, query, 'publisher'),
      dates: createDateOptions(),
      page,
      pageSize,
    })
  }

  if (view === 'gender' || view === 'age') {
    const rows = view === 'gender' ? genderRows : ageRows
    const labelKey = view === 'gender' ? 'gender' : 'ageGroup'
    const total = view === 'gender' ? genderTotal : ageTotal

    return createResponse({
      view,
      reports: filterBySearch(addCampaign(rows), query, labelKey),
      total: query ? null : addCampaign([total])[0],
      dates: createDateOptions(),
      page,
      pageSize,
    })
  }

  const dateReports = date === 'all'
    ? reportRows
    : reportRows.filter((row) => row.id === date)
  const reports = filterBySearch(addCampaign(dateReports), query, 'date')

  return createResponse({
    view: 'day',
    reports,
    total: date === 'all' && !query ? addCampaign([dayTotal])[0] : null,
    dates: createDateOptions(),
    page,
    pageSize,
  })
}

function createResponse({ reports, page, pageSize, ...response }) {
  const totalItems = reports.length

  if (pageSize === 'all') {
    return {
      ...response,
      reports,
      pagination: { page: 1, pageSize: totalItems, totalItems, totalPages: 1 },
    }
  }

  const normalizedPageSize = Math.min(normalizePositiveInteger(pageSize, 5), 50)
  const totalPages = Math.max(1, Math.ceil(totalItems / normalizedPageSize))
  const normalizedPage = Math.min(normalizePositiveInteger(page, 1), totalPages)
  const start = (normalizedPage - 1) * normalizedPageSize

  return {
    ...response,
    reports: reports.slice(start, start + normalizedPageSize),
    pagination: {
      page: normalizedPage,
      pageSize: normalizedPageSize,
      totalItems,
      totalPages,
    },
  }
}

function normalizePositiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10)
  return Number.isInteger(number) && number > 0 ? number : fallback
}

function createDateOptions(rows = reportRows) {
  return rows.map(({ id, date: label }) => ({ value: id, label }))
}

function addCampaign(rows) {
  return rows.map((row) => ({ campaign: campaignName, ...row }))
}

function filterBySearch(rows, query, labelKey) {
  if (!query) return rows

  return rows.filter((row) =>
    (row.campaign ?? '').toLowerCase().includes(query)
    || String(row[labelKey] ?? '').toLowerCase().includes(query))
}
