import Koa from 'koa'
import cors from '@koa/cors'
import KoaBodyparser from 'koa-bodyparser'
import KoaRouter from '@koa/router'

interface Config {
  readonly port: number
  readonly router: KoaRouter
}

interface Server {
  readonly start: () => void
}

export const Server = ({ port, router }: Config): Server => {
  const koa = new Koa()
    .use(cors())
    .use(KoaBodyparser())
    .use(router.routes())
    .use(router.allowedMethods())

  const start = () => {
    koa.listen(port, '0.0.0.0')
  }

  return {
    start,
  }
}
