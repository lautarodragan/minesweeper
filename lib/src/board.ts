import {
  CELL_KNOWN_MINE,
  CELL_UNKNOWN_CLEAR,
  CELL_UNKNOWN_CLEAR_FLAG,
  CELL_UNKNOWN_MINE,
  CELL_UNKNOWN_MINE_FLAG
} from './cell'

export const makeEmptyBoard = (width, height) => Array(width).fill(null).map(y => Array(height).fill(CELL_UNKNOWN_CLEAR))

export const mapBoard = (board, callback) => board.map((columnCells, y) => columnCells.map((cell, x) => callback(x, y, cell)))

export const cloneBoard = (board) => mapBoard(board, (x, y, value) => value)

export const makeMines = (width, height, mineCount) => {
  const mines = []

  while (mines.length < mineCount) {
    let newMine

    while (!newMine || mines.find(mine => mine.x === newMine.x && mine.y === newMine.y)) {
      newMine = {
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
      }
    }

    mines.push(newMine)
  }

  return mines
}

export const makeBoard = (width, height, mineCount = 40) => {
  const mines = makeMines(width, height, mineCount)

  return mapBoard(
    makeEmptyBoard(width, height),
    (x, y) => mines.some(mine => mine.x === x && mine.y === y) ? CELL_UNKNOWN_MINE : CELL_UNKNOWN_CLEAR,
  )
}

export const getSurroundingMineCount = (board, x, y) => {
  let sum = 0
  for (let j = Math.max(0, y - 1); j < Math.min(board.length, y + 2); j++)
    for (let i = Math.max(0, x - 1); i < Math.min(board[0].length, x + 2); i++)
      if ((x !== i || y !== j) && [CELL_UNKNOWN_MINE, CELL_KNOWN_MINE, CELL_UNKNOWN_MINE_FLAG].includes(board[j][i]))
        sum++;
  return sum
}

export const getSurroundingFlagCount = (board, x, y) => {
  let sum = 0
  for (let j = Math.max(0, y - 1); j < Math.min(board.length, y + 2); j++)
    for (let i = Math.max(0, x - 1); i < Math.min(board[0].length, x + 2); i++)
      if ((x !== i || y !== j) && [CELL_UNKNOWN_MINE_FLAG, CELL_UNKNOWN_CLEAR_FLAG].includes(board[j][i]))
        sum++;
  return sum
}

export const getFlagCount = (board) => {
  let sum = 0
  for (let y = 0; y < board.length; y++)
    for (let x = 0; x < board[0].length; x++)
      if ([CELL_UNKNOWN_MINE_FLAG, CELL_UNKNOWN_CLEAR_FLAG].includes(board[y][x]))
        sum++;
  return sum
}

export const isWon = (board) => {
  for (let y = 0; y < board.length; y++)
    for (let x = 0; x < board[0].length; x++)
      if ([CELL_UNKNOWN_MINE, CELL_UNKNOWN_CLEAR].includes(board[y][x]))
        return false;
  return true
}
