import ExcelJS from 'exceljs'
import { ApiError } from './apiError.js'
import { normalizeAdOpsCampaignRecord } from './adOpsCampaignRecord.js'

export const adOpsWorkbookMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
export const adOpsWorkbookMaxRows = 1000

const currentTemplateMarker = 'ADOPS_TEMPLATE_V2'
const legacyTemplateMarkers = new Set(['ADOPS_TEMPLATE_V1', 'EMBASSY_ADOPS_TEMPLATE_V1'])

const reportTypes = [
  ['Summary', 'all'],
  ['Video-wise', 'video-ott'],
  ['Day-wise', 'day'],
  ['Gender-wise', 'gender'],
  ['Age-wise', 'age'],
  ['Publisher-wise', 'publisher'],
  ['Creator-wise', 'creator'],
]

const columns = [
  ['Report Type', 'reportType'],
  ['Campaign Name', 'campaignName'],
  ['Campaign Time', 'campaignTime'],
  ['Start Date', 'startDate'],
  ['End Date', 'endDate'],
  ['Date', 'date'],
  ['Gender', 'gender'],
  ['Age Group', 'ageGroup'],
  ['Publisher', 'publisher'],
  ['Campaign', 'campaign'],
  ['Creator', 'creator'],
  ['Impression Target', 'impressionTarget'],
  ['Impression Delivered', 'impressionDelivered'],
  ['Impressions', 'impressions'],
  ['Clicks Target', 'clicksTarget'],
  ['Clicks Delivered', 'clicksDelivered'],
  ['Clicks', 'clicks'],
  ['CTR (%)', 'ctr'],
  ['Actual CTR', 'actualCtr'],
  ['Delivered CTR', 'deliveredCtr'],
  ['Reach Target', 'reachTarget'],
  ['Reach Delivered', 'reachDelivered'],
  ['Reach', 'reach'],
  ['Views Target', 'viewsTarget'],
  ['Views', 'views'],
  ['Views Delivered', 'viewsDelivered'],
  ['Spend', 'spend'],
  ['Total Budget', 'totalBudget'],
  ['Total Spend', 'totalSpend'],
]

const labelByType = new Map(reportTypes.map(([label, type]) => [label.toLowerCase(), type]))
const typeByLabel = new Map(reportTypes.map(([label, type]) => [type, label]))
const headers = columns.map(([label]) => label)
const allowedFields = {
  all: new Set([
    'campaignName', 'campaignTime', 'startDate', 'endDate',
    'impressionTarget', 'impressionDelivered', 'clicksTarget', 'clicksDelivered',
    'actualCtr', 'deliveredCtr', 'reachTarget', 'reachDelivered', 'viewsTarget',
    'viewsDelivered', 'totalBudget', 'totalSpend',
  ]),
  'video-ott': new Set(['date', 'impressions', 'clicks', 'ctr', 'reach', 'views', 'spend']),
  day: new Set(['date', 'impressions', 'clicks', 'ctr', 'reach', 'spend']),
  gender: new Set(['gender', 'impressions', 'clicks', 'ctr', 'reach']),
  age: new Set(['ageGroup', 'impressions', 'clicks', 'ctr', 'reach']),
  publisher: new Set(['publisher', 'impressions', 'clicks', 'ctr', 'reach']),
  creator: new Set(['campaign', 'creator', 'impressions', 'clicks', 'ctr', 'reach']),
}
const fieldLabels = new Map(columns.map(([label, key]) => [key, label]))
const numericFields = new Set([
  'impressionTarget', 'impressionDelivered', 'impressions', 'clicksTarget',
  'clicksDelivered', 'clicks', 'ctr', 'actualCtr', 'deliveredCtr',
  'reachTarget', 'reachDelivered', 'reach', 'viewsTarget', 'views',
  'viewsDelivered', 'totalBudget', 'spend', 'totalSpend',
])

const dateFields = new Set(['startDate', 'endDate', 'date'])
const requiredFields = {
  all: new Set(['campaignName']),
  'video-ott': new Set(['date']),
  day: new Set(['date']),
  gender: new Set(['gender']),
  age: new Set(['ageGroup']),
  publisher: new Set(['publisher']),
  creator: new Set(['campaign', 'creator']),
}
const sectionFields = {
  all: [
    'campaignName', 'campaignTime', 'startDate', 'endDate',
    'impressionTarget', 'impressionDelivered', 'clicksTarget', 'clicksDelivered',
    'actualCtr', 'deliveredCtr', 'reachTarget', 'reachDelivered',
    'viewsTarget', 'viewsDelivered', 'totalBudget', 'totalSpend',
  ],
  'video-ott': ['date', 'impressions', 'clicks', 'ctr', 'reach', 'views', 'spend'],
  day: ['date', 'impressions', 'clicks', 'ctr', 'reach', 'spend'],
  gender: ['gender', 'impressions', 'clicks', 'ctr', 'reach'],
  age: ['ageGroup', 'impressions', 'clicks', 'ctr', 'reach'],
  publisher: ['publisher', 'impressions', 'clicks', 'ctr', 'reach'],
  creator: ['campaign', 'creator', 'impressions', 'clicks', 'ctr', 'reach'],
}

function instructionFieldHeader(key, reportType) {
  const label = fieldLabels.get(key)
  return requiredFields[reportType].has(key) ? `${label} (required)` : label
}

function sectionStartRow(sectionIndex) {
  return sectionIndex * (adOpsWorkbookMaxRows + 2) + 1
}

function isBlank(value) {
  return value == null || (typeof value === 'string' && value.trim() === '')
}

function validateDate(value, rowNumber, label) {
  if (isBlank(value)) return ''
  const date = String(value).trim()
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    throw new ApiError(400, 'INVALID_CAMPAIGN_DATE', `Row ${rowNumber}: ${label} must use YYYY-MM-DD format.`)
  }
  const parsed = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  if (parsed.toISOString().slice(0, 10) !== date) {
    throw new ApiError(400, 'INVALID_CAMPAIGN_DATE', `Row ${rowNumber}: ${label} is not a valid date.`)
  }
  return date
}

function cellValue(cell, rowNumber) {
  const value = cell.value
  if (value == null) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string' || typeof value === 'number') return value
  throw new ApiError(
    400,
    'INVALID_TEMPLATE_CELL',
    `Row ${rowNumber} contains a formula or unsupported cell value.`,
  )
}

function normalizeRowRecord(source, rowNumber, reportType) {
  if (!reportType) {
    throw new ApiError(
      400,
      'INVALID_REPORT_TYPE',
      `Row ${rowNumber}: choose a report type from the template dropdown.`,
    )
  }
  const allowed = allowedFields[reportType]
  const allKeys = new Set(columns.map(([, key]) => key))
  for (const key of allKeys) {
    if (key === 'reportType' || allowed.has(key) || isBlank(source[key])) continue
    throw new ApiError(
      400,
      'FIELD_NOT_ALLOWED_FOR_REPORT_TYPE',
      `Row ${rowNumber}: ${fieldLabels.get(key)} is not used for ${typeByLabel.get(reportType)}.`,
    )
  }

  const recordInput = { reportType }
  for (const key of allowed) {
    const value = source[key]
    if (dateFields.has(key)) {
      recordInput[key] = validateDate(value, rowNumber, fieldLabels.get(key))
    } else if (numericFields.has(key) && !isBlank(value)) {
      const number = Number(value)
      if (!Number.isFinite(number) || number < 0) {
        throw new ApiError(
          400,
          'INVALID_CAMPAIGN_FIELD',
          `Row ${rowNumber}: ${fieldLabels.get(key)} must be a non-negative number.`,
        )
      }
      recordInput[key] = number
    } else {
      recordInput[key] = isBlank(value) ? '' : String(value).trim()
    }
  }

  if (reportType === 'all') {
    const record = normalizeAdOpsCampaignRecord(recordInput)
    if (record.startDate && record.endDate && record.endDate < record.startDate) {
      throw new ApiError(400, 'INVALID_DATE_RANGE', `Row ${rowNumber}: End Date must be on or after Start Date.`)
    }
    for (const key of ['impressionDelivered', 'clicksDelivered', 'actualCtr', 'deliveredCtr', 'reachDelivered', 'viewsDelivered', 'totalBudget', 'totalSpend']) {
      const value = source[key]
      if (isBlank(value)) continue
      const number = Number(value)
      if (!Number.isFinite(number) || number < 0) {
        throw new ApiError(400, 'INVALID_CAMPAIGN_FIELD', `Row ${rowNumber}: ${fieldLabels.get(key)} must be a non-negative number.`)
      }
      record[key] = number
    }
    return { ...record, reportType }
  }

  try {
    return normalizeAdOpsCampaignRecord(recordInput)
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ApiError(error.statusCode, error.code, `Row ${rowNumber}: ${error.message}`)
    }
    throw error
  }
}

function buildLegacyRowRecord(worksheetRow, rowNumber) {
  const source = {}
  columns.forEach(([, key], index) => {
    source[key] = cellValue(worksheetRow.getCell(index + 1), rowNumber)
  })

  const reportType = labelByType.get(String(source.reportType).trim().toLowerCase())
  return normalizeRowRecord(source, rowNumber, reportType)
}

export async function createAdOpsWorkbookTemplate() {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Embassy Reporting Dashboard'
  workbook.subject = 'Ad-ops bulk upload template'
  workbook.title = 'Ad-ops bulk upload template'
  workbook.properties.date1904 = false

  const instructions = workbook.addWorksheet('Instructions')
  instructions.getCell('A1').value = currentTemplateMarker
  instructions.getCell('A2').value = 'Use the Upload Data sheet. Do not rename sheets or change its header row. The sections below show the column headings for each report type.'
  const instructionColumns = {
    all: [
      'Campaign Name (required)', 'Campaign Time', 'Start Date', 'End Date',
      'Impression Target', 'Impression Delivered', 'Clicks Target', 'Clicks Delivered',
      'Actual CTR', 'Delivered CTR', 'Reach Target', 'Reach Delivered',
      'Views Target', 'Views Delivered', 'Total Budget', 'Total Spend',
    ],
    'video-ott': ['Date (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach', 'Views', 'Spend'],
    day: ['Date (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach', 'Spend'],
    gender: ['Gender (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach'],
    age: ['Age Group (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach'],
    publisher: ['Publisher (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach'],
    creator: ['Campaign (required)', 'Creator (required)', 'Impressions', 'Clicks', 'CTR (%)', 'Reach'],
  }


  let instructionRow = 5
  reportTypes.forEach(([label, type]) => {
    const fieldHeaders = instructionColumns[type]
    instructions.mergeCells(instructionRow, 1, instructionRow, fieldHeaders.length)
    instructions.getCell(instructionRow, 1).value = label
    instructions.getRow(instructionRow).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    instructions.getRow(instructionRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1760F5' } }

    const headerRow = instructions.getRow(instructionRow + 1)
    fieldHeaders.forEach((field, fieldIndex) => {
      headerRow.getCell(fieldIndex + 1).value = field
      instructions.getColumn(fieldIndex + 1).width = Math.max(
        instructions.getColumn(fieldIndex + 1).width || 0,
        Math.min(Math.max(field.length + 3, 18), 30),
      )
    })
    headerRow.font = { bold: true }
    headerRow.alignment = { vertical: 'middle', wrapText: true }
    instructionRow += 3
  })
  instructions.state = 'visible'

  const upload = workbook.addWorksheet('Upload Data')
  reportTypes.forEach(([label, type], sectionIndex) => {
    const startRow = sectionStartRow(sectionIndex)
    const keys = sectionFields[type]
    upload.mergeCells(startRow, 1, startRow, keys.length)
    const titleRow = upload.getRow(startRow)
    titleRow.getCell(1).value = label
    titleRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1760F5' } }

    const headerRow = upload.getRow(startRow + 1)
    keys.forEach((key, index) => {
      const fieldHeader = instructionFieldHeader(key, type)
      headerRow.getCell(index + 1).value = fieldHeader
      const column = upload.getColumn(index + 1)
      column.width = Math.max(column.width || 0, Math.min(Math.max(fieldHeader.length + 3, 18), 30))
    })
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5478A5' } }
    headerRow.alignment = { vertical: 'middle', wrapText: true }
    headerRow.height = 30

    keys.forEach((key, index) => {
      if (!dateFields.has(key)) return
      for (let rowNumber = startRow + 2; rowNumber < startRow + adOpsWorkbookMaxRows + 2; rowNumber += 1) {
        upload.getCell(rowNumber, index + 1).numFmt = 'yyyy-mm-dd'
      }
    })
  })

  return workbook.xlsx.writeBuffer()
}

export async function parseAdOpsWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook()
  try {
    await workbook.xlsx.load(buffer)
  } catch {
    throw new ApiError(400, 'INVALID_EXCEL_FILE', 'Upload a valid Excel template file.')
  }

  const marker = workbook.getWorksheet('Instructions')?.getCell('A1').value
  if (
    workbook.worksheets.length !== 2 ||
    !workbook.getWorksheet('Upload Data') ||
    (marker !== currentTemplateMarker && !legacyTemplateMarkers.has(marker))
  ) {
    throw new ApiError(
      400,
      'INVALID_TEMPLATE',
      'This file is not the Embassy Ad-ops template. Download the latest template and try again.',
    )
  }

  const worksheet = workbook.getWorksheet('Upload Data')
  if (marker === currentTemplateMarker) {
    const records = []
    reportTypes.forEach(([label, type], sectionIndex) => {
      const startRow = sectionStartRow(sectionIndex)
      const keys = sectionFields[type]
      const actualHeaders = keys.map((key, index) => worksheet.getRow(startRow + 1).getCell(index + 1).value)
      const expectedHeaders = keys.map((key) => instructionFieldHeader(key, type))
      if (
        worksheet.getRow(startRow).getCell(1).value !== label ||
        actualHeaders.some((header, index) => header !== expectedHeaders[index])
      ) {
        throw new ApiError(
          400,
          'INVALID_TEMPLATE_HEADERS',
          `The ${label} section headings were changed. Download and use the latest template.`,
        )
      }

      for (let rowNumber = startRow + 2; rowNumber < startRow + adOpsWorkbookMaxRows + 2; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber)
        const source = {}
        keys.forEach((key, index) => {
          source[key] = cellValue(row.getCell(index + 1), rowNumber)
        })
        if (Object.values(source).every(isBlank)) continue
        if (records.length >= adOpsWorkbookMaxRows) {
          throw new ApiError(400, 'TOO_MANY_ROWS', `A maximum of ${adOpsWorkbookMaxRows} rows can be uploaded at once.`)
        }
        records.push(normalizeRowRecord(source, rowNumber, type))
      }
    })
    if (!records.length) {
      throw new ApiError(
        400,
        'EMPTY_UPLOAD',
        'No data rows were found in Upload Data. The Instructions sheet is a guide only; enter values below the headings in a report section on the Upload Data sheet.',
      )
    }
    return records
  }

  const actualHeaders = headers.map((_, index) => worksheet.getRow(1).getCell(index + 1).value)
  if (
    worksheet.getRow(1).cellCount !== headers.length ||
    actualHeaders.some((header, index) => header !== headers[index])
  ) {
    throw new ApiError(
      400,
      'INVALID_TEMPLATE_HEADERS',
      'The Upload Data sheet headers were changed. Use the downloaded template without changing its headings.',
    )
  }

  const records = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const values = columns.map((_, index) => row.getCell(index + 1).value)
    if (values.every(isBlank)) return
    if (records.length >= adOpsWorkbookMaxRows) {
      throw new ApiError(400, 'TOO_MANY_ROWS', `A maximum of ${adOpsWorkbookMaxRows} rows can be uploaded at once.`)
    }
    records.push(buildLegacyRowRecord(row, rowNumber))
  })
  if (!records.length) {
    throw new ApiError(400, 'EMPTY_UPLOAD', 'Add at least one data row to the Upload Data sheet.')
  }
  return records
}
