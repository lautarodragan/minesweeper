import { Business } from './business'
import { Router } from './routes'
import { Server } from './server'

const business = Business({ games: [] })
const router = Router({ business })
const server = Server({ router })

server.start()
