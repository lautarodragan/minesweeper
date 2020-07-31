import KoaRouter from '@koa/router'

import { Business } from './business'

interface Config {
  readonly business: Business
}

export const Router = ({ business }: Config) => {
  const router = new KoaRouter()

  router.get('/', (ctx, next) => {
    ctx.status = 200
    ctx.body = {
      message: 'hello world',
    }
  })

  router.get('/games', (ctx, next) => {
    const games = business.getGames()
    ctx.status = 200
    ctx.body = games
  })

  router.get('/games/:id', (ctx, next) => {
    const { id } = ctx.params
    const game = business.getGameById(id)

    if (game) {
      ctx.status = 200
      ctx.body = game
    } else {
      ctx.status = 404
    }
  })

  router.post('/games', (ctx, next) => {
    const game = ctx.request.body

    try {
      business.createGame(game)
      ctx.status = 201
    } catch (error) {
      // Assume error is always Used ID. We'll decouple this later.
      ctx.body = 'Id in use.'
      ctx.status = 422
    }
  })

  return router
}
