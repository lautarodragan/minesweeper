import KoaRouter from '@koa/router'

const games: any[] = []

export const Router = () => {
  const router = new KoaRouter()

  router.get('/', (ctx, next) => {
    ctx.status = 200
    ctx.body = {
      message: 'hello world',
    }
  })

  router.get('/games', (ctx, next) => {
    ctx.status = 200
    ctx.body = games
  })

  router.get('/games/:id', (ctx, next) => {
    const { id } = ctx.params
    const game = games.find(game => game.id === id)

    if (game) {
      ctx.status = 200
      ctx.body = game
    } else {
      ctx.status = 404
    }
  })

  router.post('/games', (ctx, next) => {
    const game = ctx.request.body

    if (games.some(_ => _.id === game.id)) {
      ctx.body = 'Id in use.'
      ctx.status = 422
    }

    games.push(game)
    ctx.status = 201
  })

  return router
}
