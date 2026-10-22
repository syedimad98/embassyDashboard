import { getReportData } from './reportData.js'
import { closeDatabase } from './database.js'
import { seedReportSnapshots } from './reportRepository.js'

try {
  await seedReportSnapshots(getReportData)
  console.log('Report snapshots stored in MongoDB.')
} catch (error) {
  console.error('Could not seed report snapshots:', error)
  process.exitCode = 1
} finally {
  await closeDatabase()
}
