import { makeBoard } from '@taros-minesweeper/lib'

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
    const { id, width = 10, height = 10, mineCount = 10 } = game

    if (games.some(_ => _.id === game.id))
      throw new Error()

    const board = makeBoard(width, height, mineCount)

    const newGame = {
      id,
      width,
      height,
      mineCount,
      board,
    }
    games.push(newGame)
  }

  return {
    getGames,
    getGameById,
    createGame,
  }
}
