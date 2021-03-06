import { isRevealed, setIsRevealed } from './cell'
import { Board, cloneBoard, getSurroundingMineCount } from './board'

export const reveal = (board: Board, x: number, y: number): Board => {
  const newBoard = cloneBoard(board)

  const width = board[0].length
  const height = board.length

  const recursive = (x: number, y: number) => {
    if (!isInBounds(x, y, width, height))
      return

    if (isRevealed(newBoard[y][x]))
      return

    newBoard[y][x] = setIsRevealed(newBoard[y][x], true)

    if (getSurroundingMineCount(board, x, y))
      return

    for (let i = x - 1; i < x + 2; i++)
      for (let j = y - 1; j < y + 2; j++)
        if (i !== x || j !== y)
          recursive(i, j)
  }

  recursive(x, y)

  return newBoard
}

const isInBounds = (x: number, y: number, width: number, height: number): boolean =>
  x >= 0 && x < width && y >= 0 && y < height
