import { makeBoard, CellValue, toggleFlag, sweep, getSurroundingFlagCount, getSurroundingMineCount } from '@taros-minesweeper/lib'

import { Game } from './game'
import { reveal, isWon } from '@taros-minesweeper/lib/dist'

interface Config {
  readonly games: Game[]
}

export interface Business {
  readonly getGames: (userId: string) => readonly Omit<Game, 'board'>[]
  readonly getGameById: (id: string) => Game | undefined
  readonly createGame: (game: Game) => void
  readonly setGameCell: (userId: string, gameId: string, x: number, y: number, value: CellValue) => void
}

export const Business = ({ games }: Config): Business => {

  const getGames = (userId: string) =>
    games
      .filter(game => game.userId === userId)
      .map(({ board, ...game }) => ({ ...game }))

  const getGameById = (id: string) => {
    // TODO: UnauthorizedError
    const game = games.find(game => game.id === id)
    return game
  }

  const createGame = (game: Game) => {
    const { userId, id, width = 10, height = 10, mineCount = 10 } = game

    if (games.some(_ => _.id === game.id))
      throw new Error()

    const board = makeBoard(width, height, mineCount)

    const newGame = {
      userId,
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

  const setGameCell = (userId: string, gameId: string, x: number, y: number, value: CellValue) => {
    const game = games.find(_ => _.id === gameId)

    if (!game)
      throw new Error() // TODO: NotFoundError

    if (game.userId !== userId)
      throw new Error() // TODO: UnauthorizedError

    const cellValue = game.board[y][x]
    if (value === CellValue.KnownClear) {
      if (cellValue === CellValue.UnknownClear || cellValue === CellValue.UnknownMine) {
        const lost = cellValue === CellValue.UnknownMine

        if (lost) {
          game.lost = true
          game.lostPosition = { x, y }
          return
        }

        const newBoard = reveal(game.board, x, y)

        if (isWon(newBoard))
          game.won = true

        game.board = newBoard
      } else if (cellValue === CellValue.KnownClear) {
        const surroundingMineCount = getSurroundingMineCount(game.board, x, y)
        const surroundingFlagCount = getSurroundingFlagCount(game.board, x, y)

        if (surroundingMineCount === surroundingFlagCount) {
          const { losePosition, board: newBoard } = sweep(game.board, x, y)
          if (losePosition) {
            game.lost = true
            game.lostPosition = losePosition
          } else {
            game.board = newBoard
          }
        }

      }
    } else if (value === CellValue.UnknownMineFlag) {
      game.board[y][x] = toggleFlag(cellValue)
    }

  }

  return {
    getGames,
    getGameById,
    createGame,
    setGameCell,
  }
}
