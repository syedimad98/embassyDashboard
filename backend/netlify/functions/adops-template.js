import { getAuthorization, respondWithApiError } from '../../server/apiHandlers.js'
import { requireAdOps } from '../../server/auth.js'
import {
  adOpsWorkbookMimeType,
  createAdOpsWorkbookTemplate,
} from '../../server/adOpsWorkbook.js'

export const handler = async (event) => {
  try {
    requireAdOps(getAuthorization(event.headers))
    const workbook = await createAdOpsWorkbookTemplate()
    return {
      statusCode: 200,
      headers: {
        'content-type': adOpsWorkbookMimeType,
        'content-disposition': 'attachment; filename="adops-template.xlsx"',
      },
      body: Buffer.from(workbook).toString('base64'),
      isBase64Encoded: true,
    }
  } catch (error) {
    const result = respondWithApiError(error)
    return {
      statusCode: result.statusCode,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(result.body),
    }
  }
}
