import { closeDatabase, getDatabase } from './database.js'

const email = process.argv[2]?.trim().toLowerCase()

if (!email) {
  console.error('Usage: npm run admin:promote -- user@example.com')
  process.exitCode = 1
} else {
  try {
    const result = await (await getDatabase())
      .collection('users')
      .updateOne({ email }, { $set: { role: 'admin' } })

    if (result.matchedCount === 0) {
      console.error(`No user found for ${email}. Sign up before promoting the account.`)
      process.exitCode = 1
    } else {
      console.log(`Admin access granted to ${email}.`)
    }
  } catch (error) {
    console.error('Could not promote admin account:', error)
    process.exitCode = 1
  } finally {
    await closeDatabase()
  }
}
