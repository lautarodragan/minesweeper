interface Config {
  readonly games: Game[]
}

export interface Business {
  readonly getGames: () => readonly Game[]
  readonly getGameById: (id: string) => Game | undefined
  readonly createGame: (game: Game) => void
}

export const Business = ({ games }: Config): Business => {

  const getGames = () => games

  const getGameById = (id: string) => {
    const game = games.find(game => game.id === id)
    return game
  }

  const createGame = (game: Game) => {
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
