import cors from '@koa/cors'
import Koa from 'koa'
import KoaRouter from'@koa/router'
import KoaBodyparser from 'koa-bodyparser'

const router = new KoaRouter()

router.get('/', (ctx, next) => {
  ctx.status = 200
  ctx.body = {
    message: 'hello world',
  }
})

const koa = new Koa()
  .use(cors())
  .use(KoaBodyparser())
  .use(router.routes())
  .use(router.allowedMethods())

const server = koa.listen(8000, '0.0.0.0')
