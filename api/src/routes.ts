import KoaRouter from '@koa/router'

import { Business } from './business'

interface Config {
  readonly business: Business
}

export const Router = ({ business }: Config) => {
  const router = new KoaRouter()

  router.get('/', (ctx, next) => {
    console.log('/', ctx.state.user)
    ctx.status = 200
    ctx.body = {
      message: 'hello world',
    }
  })

  router.get('/games', async (ctx, next) => {
    const { user } = ctx.state
    const games = await business.getGames(user.sub)
    ctx.status = 200
    ctx.body = games
  })

  router.get('/games/:id', async (ctx, next) => {
    const { user } = ctx.state
    const { id } = ctx.params
    const game = await business.getGameById(user.sub, id)

    if (game) {
      ctx.status = 200
      ctx.body = game
    } else {
      ctx.status = 404
    }
  })

  router.post('/games', async (ctx, next) => {
    const game = ctx.request.body
    const { user } = ctx.state

    try {
      await business.createGame({
        ...game,
        userId: user.sub,
      })
      ctx.status = 201
    } catch (error) {
      // Assume error is always Used ID. We'll decouple this later.
      ctx.body = 'Id in use.'
      ctx.status = 422
    }
  })

  router.put('/games/:gameId/cells/:cellId', async (ctx, next) => {
    const { gameId, cellId } = ctx.params
    const { value } = ctx.request.body
    const { user } = ctx.state

    const [x, y] = cellId.split(',')

    try {
      await business.setGameCell(user.sub, gameId, parseInt(x), parseInt(y), value)
      ctx.status = 200
    } catch (error) {
      // Assume error is always 404 Game Not Found. We'll decouple this later.
      ctx.body = `No game with id "${gameId}"`
      ctx.status = 404
    }
  })

  return router
}
