import {
  adminExportHandler,
  adminReportHandler,
  getAuthorization,
  loginHandler,
  parseRequestBody,
  respondWithApiError,
  signupHandler,
} from '../../server/apiHandlers.js'
import { createReportCsv } from '../../server/reportCsv.js'

export function createAuthHandler(action) {
  return async (event) => {
    try {
      const body = parseRequestBody(event.body, event.isBase64Encoded)
      const result = await action(body)
      return jsonResponse(result.statusCode, result.body)
    } catch (error) {
      const result = respondWithApiError(error)
      return jsonResponse(result.statusCode, result.body)
    }
  }
}

export function createReportHandler(type) {
  return async (event) => {
    try {
      const result = await adminReportHandler(type, getAuthorization(event.headers), event.queryStringParameters ?? {})
      return jsonResponse(result.statusCode, result.body)
    } catch (error) {
      const result = respondWithApiError(error)
      return jsonResponse(result.statusCode, result.body)
    }
  }
}

export function createExportHandler() {
  return async (event) => {
    try {
      const type = event.queryStringParameters?.type
      const result = await adminExportHandler(
        type,
        getAuthorization(event.headers),
        event.queryStringParameters ?? {},
        createReportCsv,
      )
      return {
        statusCode: result.statusCode,
        headers: {
          'content-type': result.contentType,
          'content-disposition': result.contentDisposition,
        },
        body: result.body,
      }
    } catch (error) {
      const result = respondWithApiError(error)
      return jsonResponse(result.statusCode, result.body)
    }
  }
}

export const handleSignup = createAuthHandler(signupHandler)
export const handleLogin = createAuthHandler(loginHandler)

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  }
}
