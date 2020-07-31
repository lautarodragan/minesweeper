import { CellValue } from './cell'
import { Board, cloneBoard, getSurroundingMineCount } from './board'

export const reveal = (board: Board, x: number, y: number): Board => {
  const newBoard = cloneBoard(board)

  const width = board[0].length
  const height = board.length

  const recursive = (x: number, y: number) => {
    if (!isInBounds(x, y, width, height))
      return

    if (newBoard[y][x] !== CellValue.UnknownClear)
      return

    newBoard[y][x] = CellValue.KnownClear

    if (getSurroundingMineCount(board, x, y))
      return

    recursive(x + 1, y)
    recursive(x - 1, y)
    recursive(x, y + 1)
    recursive(x, y - 1)
  }

  recursive(x, y)

  return newBoard
}

const isInBounds = (x: number, y: number, width: number, height: number): boolean =>
  x >= 0 && x < width && y >= 0 && y < height
