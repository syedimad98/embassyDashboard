import 'dotenv/config'
import { MongoClient } from 'mongodb'

let client
let connection

export async function getDatabase() {
  const uri = process.env.MONGODB_URI
  const databaseName = process.env.MONGODB_DB

  if (!uri || !databaseName) {
    throw new Error('MongoDB is not configured. Set MONGODB_URI and MONGODB_DB.')
  }

  if (!connection) {
    client = new MongoClient(uri)
    connection = client.connect().catch((error) => {
      connection = null
      client = null
      throw error
    })
  }

  await connection
  return client.db(databaseName)
}

export async function closeDatabase() {
  if (!client) return

  await client.close()
  client = null
  connection = null
}
