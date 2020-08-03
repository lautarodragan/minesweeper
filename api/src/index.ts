import { Business } from './business'
import { Router } from './routes'
import { Server } from './server'
import { Dao } from './dao'
import { MongoClient } from 'mongodb'

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000
const dbUrl = process.env.MONGO_URL

async function main() {
  if (!dbUrl)
    throw new Error('MONGO_URL not set.')

  const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
  const db = client.db('minesweeper')
  const collection = db.collection('games')

  const dao = Dao({ collection })
  const business = Business({ dao })
  const router = Router({ business })
  const server = Server({ router, port })

  server.start()

  console.log(`Taro's Minesweeper API up and running!`)
  console.log(`Listening on port ${port}.`)
  console.log(`MongoDB URL is ${dbUrl}.`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
