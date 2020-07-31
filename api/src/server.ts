import Koa from 'koa'
import cors from '@koa/cors'
import KoaBodyparser from 'koa-bodyparser'
import KoaRouter from '@koa/router'

interface Config {
  readonly router: KoaRouter
}

interface Server {
  readonly start: () => void
}

export const Server = ({ router }: Config): Server => {
  const koa = new Koa()
    .use(cors())
    .use(KoaBodyparser())
    .use(router.routes())
    .use(router.allowedMethods())

  const start = () => {
    koa.listen(8000, '0.0.0.0')
  }

  return {
    start,
  }
}
