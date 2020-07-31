import { CellValue } from './cell'
import { Board, cloneBoard } from './board'
import { reveal } from './solve'
import { Coord } from './coord'

type Sweep = {
  readonly losePosition?: Coord
  readonly board?: Board
}

export const sweep = (board: Board, x: number, y: number): Sweep => {
  const losePosition = getSweepLosePosition(board, x, y)

  if (losePosition) {
    return { losePosition }
  } else {
    return { board: sweepSafely(board, x, y) }
  }
}

const sweepSafely = (board: Board, x: number, y: number): Board => {
  const boardWidth = board[0].length
  const boardHeight = board.length

  let newBoard = cloneBoard(board)

  for (let i = Math.max(0, x - 1); i < Math.min(x + 2, boardWidth); i++)
    for (let j = Math.max(0, y - 1); j < Math.min(y + 2, boardHeight); j++) {
      if (board[j][i] === CellValue.UnknownClear)
        newBoard = reveal(newBoard, i, j)
    }

  return newBoard
}

const getSweepLosePosition = (board: Board, x: number, y: number): Coord | null => {
  const boardWidth = board[0].length
  const boardHeight = board.length
  for (let i = Math.max(0, x - 1); i < Math.min(x + 2, boardWidth); i++)
    for (let j = Math.max(0, y - 1); j < Math.min(y + 2, boardHeight); j++)
      if (board[j][i] === CellValue.UnknownMine)
        return { x: i, y: j }
  return null
}
