import { getReportData } from '../../server/reportData.js'
import { createReportCsv } from '../../server/reportCsv.js'

export const handler = async (event) => {
  const { reports, total } = getReportData({
    ...event.queryStringParameters,
    pageSize: 'all',
  })
  const exportRows = total ? [...reports, total] : reports

  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="audience-delivery-report.csv"',
    },
    body: createReportCsv(exportRows, event.queryStringParameters?.view),
  }
}