import React, {useState} from 'react'
import { CellValue, getSurroundingMineCount } from '@taros-minesweeper/lib'

export const Minesweeper = ({
  board,
  mineCount,
  flagCount,
  won,
  lostPosition,
  cheatSeeMines,
  gameDuration,
  onReset,
  onReveal,
  onSweep,
  onFlag,
}) => {
  const [sweeperPosition, setSweeperPosition] = useState(null)

  const getClassNameForSmiley = () => {
    if (lostPosition)
      return 'lost'
    if (sweeperPosition)
      return 'wondering'
    if (won)
      return 'won'
    return ''
  }

  const getClassNameForCell = (x, y, value) => {
    if (lostPosition && lostPosition.x === x && lostPosition.y === y)
      return 'lost'
    if ((value === CellValue.UnknownMine || value === CellValue.UnknownClear)
      && sweeperPosition
      && sweeperPosition.x >= x - 1
      && sweeperPosition.x <= x + 1
      && sweeperPosition.y >= y - 1
      && sweeperPosition.y <= y + 1)
      return 'clear'
    if (lostPosition && value === CellValue.UnknownMine)
      return 'mine'
    if (!lostPosition && value === CellValue.UnknownMine)
      return cheatSeeMines ? 'unknown mine' : 'unknown'
    if (value === CellValue.KnownClear)
      return 'clear'
    if (value === CellValue.UnknownClearFlag || value === CellValue.UnknownMineFlag)
      return 'unknown flag'
    return 'unknown'
  }

  const onMouseDown = (x, y, value) => (event) => {
    event.preventDefault()

    if (won || lostPosition)
      return

    if (event.buttons === 3)
      setSweeperPosition({ x, y })
  }

  const onMouseMove = (x, y, value) => (event) => {
    event.preventDefault()

    if (won || lostPosition)
      return

    if (event.buttons === 3)
      setSweeperPosition({ x, y })
  }

  const onMouseUp = (x, y, value) => (event) => {
    event.preventDefault()

    if (won || lostPosition)
      return

    setSweeperPosition(null)

    if (event.button === 0) {
      if (value === CellValue.UnknownClear || value === CellValue.UnknownMine)
        onReveal(x, y, value)
      else if (value === CellValue.KnownClear)
        onSweep(x, y, value)
    }
  }

  return (
    <section>
      <section className="top-bar">
        <div><span className="dseg">{mineCount - flagCount}</span></div>
        <div onClick={onReset} className={'smile ' + getClassNameForSmiley()}></div>
        <div><span className="dseg">{gameDuration || '00:00'}</span></div>
      </section>
      <section className="board">
        {
          board.map((columnCells, y) => (
            columnCells.map((cell, x) => (
              <div
                key={`${x}, ${y}`}
                title={`(${x}, ${y}) ${cell}`}
                onClick={() => onReveal(x, y, cell)}
                onContextMenuCapture={onFlag(x, y)}
                onMouseDown={onMouseDown(x, y, cell)}
                onMouseMove={onMouseMove(x, y, cell)}
                onMouseUp={onMouseUp(x, y, cell)}
                className={getClassNameForCell(x, y, cell)}
              >
                {getCellText(board, x, y)}
              </div>
            ))
          ))
        }
      </section>
    </section>
  )
}

const getCellText = (board, x, y) => {
  if (board[y][x] !== CellValue.KnownClear)
    return ''
  const surroundingMineCount = getSurroundingMineCount(board, x, y)
  if (surroundingMineCount < 1)
    return ''
  return surroundingMineCount
}
