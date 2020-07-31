import { Business } from './business'
import { Router } from './routes'
import { Server } from './server'

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000

const business = Business({ games: [] })
const router = Router({ business })
const server = Server({ router, port })

server.start()

console.log(`Taro's Minesweeper API up and running! Listening on port ${port}.`)
