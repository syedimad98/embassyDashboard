import { ApiError } from './apiError.js'
import { login, requireAdmin, signup } from './auth.js'
import { getStoredReportData } from './reportRepository.js'

export async function signupHandler(body) {
  return { statusCode: 201, body: await signup(body) }
}

export async function loginHandler(body) {
  return { statusCode: 200, body: await login(body) }
}

export async function adminReportHandler(type, authorization, query) {
  requireAdmin(authorization)
  return {
    statusCode: 200,
    body: await getStoredReportData(type, query),
  }
}

export async function adminExportHandler(type, authorization, query, createReportCsv) {
  requireAdmin(authorization)
  const report = await getStoredReportData(type, { ...query, pageSize: 'all' })
  const rows = report.total ? [...report.reports, report.total] : report.reports

  return {
    statusCode: 200,
    contentType: 'text/csv; charset=utf-8',
    contentDisposition: 'attachment; filename="audience-delivery-report.csv"',
    body: createReportCsv(rows, report.view),
  }
}

export function parseRequestBody(body, isBase64Encoded = false) {
  if (!body) return {}
  try {
    const json = isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body
    return JSON.parse(json)
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must contain valid JSON.')
  }
}

export function getAuthorization(headers = {}) {
  headers ??= {}
  return headers.authorization ?? headers.Authorization
}

export function respondWithApiError(error) {
  if (error?.type === 'entity.parse.failed') {
    return {
      statusCode: 400,
      body: { error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' } },
    }
  }

  if (error?.type === 'entity.too.large') {
    const uploadLimit = Number(error.limit) > 16 * 1024
    return {
      statusCode: 413,
      body: {
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: uploadLimit
            ? 'The Excel upload must not exceed 5 MB.'
            : 'Request body must not exceed 16 KB.',
        },
      },
    }
  }

  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      body: { error: { code: error.code, message: error.message } },
    }
  }

  console.error('API request failed:', error)
  return {
    statusCode: 500,
    body: { error: { code: 'INTERNAL_SERVER_ERROR', message: 'The request could not be completed.' } },
  }
}
