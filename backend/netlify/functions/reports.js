import { getReportData } from '../../server/reportData.js'

export const handler = async (event) => ({
  statusCode: 200,
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(getReportData(event.queryStringParameters ?? {})),
})