import { CellValue } from './cell'
import { cloneBoard, getSurroundingMineCount } from './board'

export const recursiveSolve = (board, x, y) => {
  const newBoard = cloneBoard(board)

  const width = board[0].length
  const height = board.length

  const recursive = (x, y) => {
    newBoard[y][x] = CellValue.KnownClear
    if (getSurroundingMineCount(board, x, y))
      return
    if (x < width - 1 && newBoard[y][x + 1] === CellValue.UnknownClear)
      recursive(x + 1, y)
    if (x > 0 && newBoard[y][x - 1] === CellValue.UnknownClear)
      recursive(x - 1, y)
    if (y < height - 1 && newBoard[y + 1][x] === CellValue.UnknownClear)
      recursive(x, y + 1)
    if (y > 0 && newBoard[y - 1][x] === CellValue.UnknownClear)
      recursive(x, y - 1)
  }

  recursive(x, y)

  return newBoard
}
