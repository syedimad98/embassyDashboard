import { ApiError } from './apiError.js'

const reportFields = {
  'video-ott': {
    text: ['date'],
    numbers: ['impressions', 'clicks', 'ctr', 'reach', 'views', 'spend'],
    required: ['date'],
  },
  day: {
    text: ['date'],
    numbers: ['impressions', 'clicks', 'ctr', 'reach', 'spend'],
    required: ['date'],
  },
  gender: {
    text: ['gender'],
    numbers: ['impressions', 'clicks', 'ctr', 'reach'],
    required: ['gender'],
  },
  age: {
    text: ['ageGroup'],
    numbers: ['impressions', 'clicks', 'ctr', 'reach'],
    required: ['ageGroup'],
  },
  publisher: {
    text: ['publisher'],
    numbers: ['impressions', 'clicks', 'ctr', 'reach'],
    required: ['publisher'],
  },
  creator: {
    text: ['campaign', 'creator'],
    numbers: ['impressions', 'clicks', 'ctr', 'reach'],
    required: ['campaign', 'creator'],
  },
}

function normalizeText(value, field) {
  if (typeof value !== 'string') {
    throw new ApiError(400, 'INVALID_CAMPAIGN_FIELD', `${field} must be text.`)
  }
  const normalized = value.trim()
  if (normalized.length > 200) {
    throw new ApiError(400, 'INVALID_CAMPAIGN_FIELD', `${field} must be 200 characters or fewer.`)
  }
  return normalized
}

function normalizeReportRecord(body) {
  const schema = reportFields[body.reportType]
  if (!schema) {
    throw new ApiError(400, 'INVALID_REPORT_TYPE', 'Select a supported report type.')
  }

  const record = { reportType: body.reportType }
  for (const field of schema.text) {
    record[field] = normalizeText(body[field] ?? '', field)
  }
  for (const field of schema.numbers) {
    const value = body[field]
    if (value === '' || value == null) {
      record[field] = null
      continue
    }
    const number = Number(value)
    if (!Number.isFinite(number) || number < 0) {
      throw new ApiError(400, 'INVALID_CAMPAIGN_FIELD', `${field} must be a non-negative number.`)
    }
    record[field] = number
  }

  if (schema.required.some((field) => !record[field])) {
    throw new ApiError(400, 'CAMPAIGN_FIELD_REQUIRED', 'Complete the required fields for this report type.')
  }
  return record
}

export function normalizeAdOpsCampaignRecord(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'INVALID_CAMPAIGN', 'Campaign data must be a JSON object.')
  }
  if (body.reportType && body.reportType !== 'all') return normalizeReportRecord(body)

  const campaignName = normalizeText(String(body.campaignName ?? ''), 'Campaign name')
  if (!campaignName) {
    throw new ApiError(400, 'CAMPAIGN_NAME_REQUIRED', 'Campaign name is required.')
  }

  return {
    campaignName,
    campaignTime: String(body.campaignTime ?? '').trim(),
    startDate: String(body.startDate ?? ''),
    endDate: String(body.endDate ?? ''),
    impressionTarget: Math.max(0, Number(body.impressionTarget) || 0),
    clicksTarget: Math.max(0, Number(body.clicksTarget) || 0),
    reachTarget: Math.max(0, Number(body.reachTarget) || 0),
    viewsTarget: Math.max(0, Number(body.viewsTarget) || 0),
  }
}
