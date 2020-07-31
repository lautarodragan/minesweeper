import { makeBoard, CellValue } from '@taros-minesweeper/lib'

import { Game } from './game'
import { reveal, isWon } from '@taros-minesweeper/lib/dist'

interface Config {
  readonly games: Game[]
}

export interface Business {
  readonly getGames: () => readonly Omit<Game, 'board'>[]
  readonly getGameById: (id: string) => Game | undefined
  readonly createGame: (game: Game) => void
  readonly setGameCell: (gameId: string, x: number, y: number, value: CellValue) => void
}

export const Business = ({ games }: Config): Business => {

  const getGames = () => games.map(({ board, ...game }) => ({ ...game }))

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
      won: false,
      lost: false,
    }
    games.push(newGame)
  }

  const setGameCell = (gameId: string, x: number, y: number, value: CellValue) => {
    const game = games.find(_ => _.id === gameId)

    if (!game)
      throw new Error() // TODO: proper error system

    const cellValue = game.board[y][x]
    if (value === CellValue.KnownClear) {
      const lost = cellValue === CellValue.UnknownMine

      if (lost) {
        game.lost = true
        return
      }

      const newBoard = reveal(game.board, x, y)

      if (isWon(newBoard))
        game.won = true

      game.board = newBoard
    } else if (value === CellValue.UnknownMineFlag) {
      // TODO: toggle flag
    }

  }

  return {
    getGames,
    getGameById,
    createGame,
    setGameCell,
  }
}
