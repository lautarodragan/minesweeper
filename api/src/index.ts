import { Router } from './routes'
import { Server } from './server'

const router = Router()
const server = Server({ router })

server.start()
