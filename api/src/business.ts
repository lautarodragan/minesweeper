interface Config {
  readonly games: any[]
}

export interface Business {
  readonly getGames: () => readonly any[]
  readonly getGameById: (id: string) => any
  readonly createGame: (game: any) => any
}

export const Business = ({ games }: Config): Business => {

  const getGames = () => games

  const getGameById = (id: string) => {
    const game = games.find(game => game.id === id)
    return game
  }

  const createGame = (game: any) => {
    if (games.some(_ => _.id === game.id))
      throw new Error()
    games.push(game)
  }

  return {
    getGames,
    getGameById,
    createGame,
  }
}
