import {
  makeBoard,
  CellValue,
  toggleFlag,
  sweep,
  getSurroundingFlagCount,
  getSurroundingMineCount,
  reveal,
  isWon,
} from '@taros-minesweeper/lib'

import { Game } from './game'
import { Dao } from './dao'

interface Config {
  readonly dao: Dao
}

export interface Business {
  readonly getGames: (userId: string) => Promise<readonly Omit<Game, 'board'>[]>
  readonly getGameById: (userId: string, id: string) => Promise<Game | undefined>
  readonly createGame: (game: Game) => Promise<void>
  readonly setGameCell: (userId: string, gameId: string, x: number, y: number, value: CellValue) => Promise<void>
}

export const Business = ({ dao }: Config): Business => {

  const getGames = (userId: string) => dao.getGames(userId)

  const getGameById = async (userId: string, id: string) => {
    const game = await dao.getGameById(id)

    console.log('getGameById', userId, id, game)

    if (!game) {
      throw new Error() // TODO: NotFoundError
    }

    if (game.userId !== userId) {
      throw new Error() // TODO: UnauthorizedError
    }

    return game
  }

  const createGame = async (game: Game) => {
    const { userId, id, width = 10, height = 10, mineCount = 10 } = game

    const idTaken = await dao.getGameById(id)

    if (idTaken)
      throw new Error()

    const board = makeBoard(width, height, mineCount)

    const newGame = {
      userId,
      id,
      creationDate: new Date().toISOString(),
      width,
      height,
      mineCount,
      board,
      won: false,
      lost: false,
    }

    await dao.insert(newGame)
  }

  const setGameCell = async (userId: string, gameId: string, x: number, y: number, value: CellValue) => {
    const game = await dao.getGameById(gameId)

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
          game.endDate = new Date().toISOString()
          return
        }

        const newBoard = reveal(game.board, x, y)

        if (isWon(newBoard)) {
          game.won = true
          game.endDate = new Date().toISOString()
        }

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
