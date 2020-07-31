import { CellValue } from './cell'
import { Coord } from './coord'

export type Board = CellValue[][]

export const makeEmptyBoard = (width: number, height: number): Board => Array(width).fill(null).map(y => Array(height).fill(CellValue.UnknownClear))

export const mapBoard = (board: Board, callback: (x: number, y: number, value: CellValue) => CellValue) =>
  board.map(
    (columnCells, y) =>
      columnCells.map(
        (cell, x) =>
          callback(x, y, cell)
      )
  )

export const cloneBoard = (board: Board): Board => mapBoard(board, (x, y, value) => value)

export const makeMines = (width: number, height: number, mineCount: number): readonly Coord[] => {
  const mines: Coord[] = []

  const mineTaken = (mine: Coord) => mines.some(_ => _.x === mine.x && _.y === mine.y)

  while (mines.length < mineCount) {
    let newMine: Coord | null = null

    while (newMine === null || mineTaken(newMine)) {
      newMine = {
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
      }
    }

    mines.push(newMine)
  }

  return mines
}

export const makeBoard = (width: number, height: number, mineCount = 40): Board => {
  const mines = makeMines(width, height, mineCount)

  return mapBoard(
    makeEmptyBoard(width, height),
    (x, y) => mines.some(mine => mine.x === x && mine.y === y) ? CellValue.UnknownMine : CellValue.UnknownClear,
  )
}

export const getSurroundingMineCount = (board: Board, x: number, y: number): number => {
  let sum = 0
  for (let j = Math.max(0, y - 1); j < Math.min(board.length, y + 2); j++)
    for (let i = Math.max(0, x - 1); i < Math.min(board[0].length, x + 2); i++)
      if ((x !== i || y !== j) && [CellValue.UnknownMine, CellValue.KnownMine, CellValue.UnknownMineFlag].includes(board[j][i]))
        sum++;
  return sum
}

export const getSurroundingFlagCount = (board: Board, x: number, y: number): number => {
  let sum = 0
  for (let j = Math.max(0, y - 1); j < Math.min(board.length, y + 2); j++)
    for (let i = Math.max(0, x - 1); i < Math.min(board[0].length, x + 2); i++)
      if ((x !== i || y !== j) && [CellValue.UnknownMineFlag, CellValue.UnknownClearFlag].includes(board[j][i]))
        sum++;
  return sum
}

export const getFlagCount = (board: Board): number => {
  let sum = 0
  for (let y = 0; y < board.length; y++)
    for (let x = 0; x < board[0].length; x++)
      if ([CellValue.UnknownMineFlag, CellValue.UnknownClearFlag].includes(board[y][x]))
        sum++;
  return sum
}

export const isWon = (board: Board): boolean => {
  for (let y = 0; y < board.length; y++)
    for (let x = 0; x < board[0].length; x++)
      if ([CellValue.UnknownMine, CellValue.UnknownClear].includes(board[y][x]))
        return false;
  return true
}
