import KoaRouter from '@koa/router'

export const Router = () => {
  const router = new KoaRouter()

  router.get('/', (ctx, next) => {
    ctx.status = 200
    ctx.body = {
      message: 'hello world',
    }
  })

  return router
}
