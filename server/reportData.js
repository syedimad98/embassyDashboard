export const campaignName = 'Embassy - Programmatic'

export const summaryRows = [
  {
    id: 'embassy-targeted',
    campaign: campaignName,
    status: 'Targeted',
    totalAudience: 6500977,
    impressions: 6000000,
    frequency: 3,
    reach: 2000000,
    reachPercent: 31,
    ctr: 0.5,
    clicks: 30000,
    cpc: 10,
    netCost: 300000,
  },
  {
    id: 'embassy-delivered',
    campaign: campaignName,
    status: 'Delivered',
    totalAudience: 6500977,
    impressions: 1623886,
    frequency: 2.93,
    reach: 554628,
    reachPercent: 8.53,
    ctr: 0.51,
    clicks: 8271,
    cpc: 10,
    netCost: 82710,
  },
]

export const reportRows = [
  { id: '22-sep', date: '22 Sep', impressions: 470042, clicks: 2432, ctr: 0.52, reach: 149967, spend: 24320 },
  { id: '23-sep', date: '23 Sep', impressions: 696945, clicks: 3422, ctr: 0.49, reach: 240965, spend: 34220 },
  { id: '24-sep', date: '24 Sep', impressions: 456899, clicks: 2417, ctr: 0.53, reach: 163696, spend: 24170 },
  { id: '25-sep', date: '25 Sep', impressions: null, clicks: null, ctr: null, reach: null, spend: null },
  { id: '26-sep', date: '26 Sep', impressions: null, clicks: null, ctr: null, reach: null, spend: null },
  { id: '27-sep', date: '27 Sep', impressions: null, clicks: null, ctr: null, reach: null, spend: null },
  { id: '28-sep', date: '28 Sep', impressions: null, clicks: null, ctr: null, reach: null, spend: null },
  { id: '29-sep', date: '29 Sep', impressions: null, clicks: null, ctr: null, reach: null, spend: null },
  { id: '30-sep', date: '30 Sep', impressions: null, clicks: null, ctr: null, reach: null, spend: null },
]

function sumReportField(field) {
  return reportRows.reduce((total, row) => total + (row[field] ?? 0), 0)
}

const totalImpressions = sumReportField('impressions')
const totalClicks = sumReportField('clicks')

export const dayTotal = {
  id: 'day-total',
  date: 'Total',
  impressions: totalImpressions,
  clicks: totalClicks,
  ctr: Number(((totalClicks / totalImpressions) * 100).toFixed(2)),
  reach: sumReportField('reach'),
  spend: sumReportField('spend'),
}

export const genderRows = [
  { id: 'male', gender: 'Male', impressions: 3730815, clicks: 19394, ctr: 0.52, reach: 1355506, spend: 193940 },
  { id: 'female', gender: 'Female', impressions: 2272106, clicks: 10962, ctr: 0.48, reach: 708612, spend: 109620 },
]

export const ageRows = [
  { id: '25-34', ageGroup: '25-34', impressions: 354818, clicks: 1528, ctr: 0.43, reach: 116784, spend: 15280 },
  { id: '35-45', ageGroup: '35-45', impressions: 721596, clicks: 3906, ctr: 0.54, reach: 255927, spend: 39060 },
  { id: '46-50', ageGroup: '46-50', impressions: 547472, clicks: 2837, ctr: 0.52, reach: 181917, spend: 28370 },
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
    spend: rows.reduce((total, row) => total + row.spend, 0),
  }
}

export const genderTotal = {
  ...createDemographicTotal(genderRows, 'gender-total', 'gender'),
  ctr: 0.51,
}

export const ageTotal = createDemographicTotal(ageRows, 'age-total', 'ageGroup')

export const publisherRows = [
  { id: 'udayavani', publisher: 'Udayavani', impressions: 145112, clicks: 767, ctr: 0.53, reach: 42720 },
  { id: 'economic-times-markets', publisher: 'The Economic Times – Markets', impressions: 120204, clicks: 617, ctr: 0.51, reach: 38646 },
  { id: 'lifestyle-asia-india', publisher: 'Lifestyle Asia India', impressions: 125863, clicks: 633, ctr: 0.50, reach: 39164 },
  { id: 'trade-brains', publisher: 'Trade Brains', impressions: 125502, clicks: 646, ctr: 0.51, reach: 40478 },
  { id: 'vijaya-karnataka', publisher: 'Vijaya Karnataka', impressions: 150936, clicks: 860, ctr: 0.57, reach: 47184 },
  { id: 'financial-express', publisher: 'Financial Express', impressions: 113364, clicks: 550, ctr: 0.49, reach: 35628 },
  { id: 'reuters-india', publisher: 'Reuters India / Reuters.com', impressions: 92506, clicks: 485, ctr: 0.52, reach: 27643 },
  { id: 'prajavani', publisher: 'Prajavani', impressions: 157166, clicks: 814, ctr: 0.52, reach: 50676 },
  { id: 'entrepreneur-india', publisher: 'Entrepreneur India', impressions: 88696, clicks: 466, ctr: 0.53, reach: 28953 },
  { id: 'gq-india', publisher: 'GQ India', impressions: 143931, clicks: 733, ctr: 0.51, reach: 48466 },
  { id: 'indian-express-lifestyle', publisher: 'Indian Express Lifestyle', impressions: 108641, clicks: 532, ctr: 0.49, reach: 34795 },
  { id: 'tv9-kannada', publisher: 'TV9 Kannada', impressions: 133920, clicks: 720, ctr: 0.54, reach: 41746 },
  { id: 'homegrown-india', publisher: 'Homegrown India', impressions: 95156, clicks: 500, ctr: 0.53, reach: 30743 },
  { id: 'kannada-prabha', publisher: 'Kannada Prabha', impressions: 123844, clicks: 675, ctr: 0.55, reach: 38666 },
  { id: 'india-today-lifestyle', publisher: 'India Today Lifestyle', impressions: 118616, clicks: 566, ctr: 0.48, reach: 38963 },
  { id: 'goodreturns', publisher: 'Goodreturns', impressions: 134311, clicks: 671, ctr: 0.50, reach: 44414 },
  { id: 'times-of-india-lifestyle', publisher: 'Times of India Lifestyle', impressions: 127701, clicks: 599, ctr: 0.47, reach: 41364 },
  { id: 'business-today', publisher: 'Business Today', impressions: 98726, clicks: 507, ctr: 0.51, reach: 31057 },
  { id: 'moneycontrol', publisher: 'Moneycontrol', impressions: 121401, clicks: 638, ctr: 0.53, reach: 39391 },
  { id: 'mans-world-india', publisher: 'Man’s World India', impressions: 138500, clicks: 700, ctr: 0.51, reach: 46299 },
  { id: 'mensxp', publisher: 'MensXP', impressions: 146688, clicks: 766, ctr: 0.52, reach: 49429 },
  { id: 'esquire-india', publisher: 'Esquire India', impressions: 129279, clicks: 665, ctr: 0.51, reach: 42106 },
  { id: 'cnbc-tv18', publisher: 'CNBC-TV18', impressions: 112362, clicks: 594, ctr: 0.53, reach: 35157 },
  { id: 'business-insider', publisher: 'Business Insider', impressions: 117896, clicks: 572, ctr: 0.49, reach: 38360 },
  { id: 'hindu-businessline', publisher: 'The Hindu BusinessLine', impressions: 105497, clicks: 528, ctr: 0.50, reach: 92726 },
  { id: 'marketwatch', publisher: 'MarketWatch', impressions: 137185, clicks: 622, ctr: 0.45, reach: 45171 },
  { id: 'business-standard', publisher: 'Business Standard', impressions: 122318, clicks: 572, ctr: 0.47, reach: 36765 },
  { id: 'bloomberg', publisher: 'Bloomberg', impressions: 97528, clicks: 463, ctr: 0.47, reach: 31800 },
  { id: 'forbes-india', publisher: 'Forbes India', impressions: 90708, clicks: 442, ctr: 0.49, reach: 28928 },
  { id: 'nasdaq', publisher: 'Nasdaq', impressions: 127150, clicks: 598, ctr: 0.47, reach: 42447 },
]

export function getReportData({ view = 'all', date = 'all', search = '', page = 1, pageSize = 5 } = {}) {
  const query = search.trim().toLowerCase()

  if (view === 'all') {
    return createResponse({
      view,
      reports: filterBySearch(summaryRows, query, 'status'),
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

function createDateOptions() {
  return reportRows.map(({ id, date: label }) => ({ value: id, label }))
}

function addCampaign(rows) {
  return rows.map((row) => ({ campaign: campaignName, ...row }))
}

function filterBySearch(rows, query, labelKey) {
  if (!query) return rows

  return rows.filter((row) =>
    row.campaign.toLowerCase().includes(query)
    || row[labelKey].toLowerCase().includes(query))
}
