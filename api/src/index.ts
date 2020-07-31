import cors from '@koa/cors'
import Koa from 'koa'
import KoaBodyparser from 'koa-bodyparser'

import { Router } from './routes'

const router = Router()

const koa = new Koa()
  .use(cors())
  .use(KoaBodyparser())
  .use(router.routes())
  .use(router.allowedMethods())

const server = koa.listen(8000, '0.0.0.0')
