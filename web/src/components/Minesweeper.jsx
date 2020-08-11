import React, {useState} from 'react'
import { getSurroundingMineCount, isRevealed, hasFlag, hasMine } from '@taros-minesweeper/lib'

export const Minesweeper = ({
  board,
  mineCount,
  flagCount,
  won,
  lostPosition,
  gameDuration,
  onReset,
  onReveal,
  onSweep,
  onFlag,
}) => {
  const [sweeperPosition, setSweeperPosition] = useState(null)
  const [cheatSeeMines, setCheatSeeMines] = useState(false)

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
    if (lostPosition && hasMine(value))
      return 'mine'
    if (!isRevealed(value) && !hasFlag(value)
      && sweeperPosition
      && sweeperPosition.x >= x - 1
      && sweeperPosition.x <= x + 1
      && sweeperPosition.y >= y - 1
      && sweeperPosition.y <= y + 1)
      return 'clear'
    if (cheatSeeMines && hasMine(value))
      return 'unknown mine'
    if (hasFlag(value))
      return 'unknown flag'
    if (isRevealed(value))
      return 'clear'
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
      if (!isRevealed(value))
        onReveal(x, y, value)
      else
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
      <section className="board-container">
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
      <Toolbar cheatSeeMines={cheatSeeMines} onCheatSeeMines={setCheatSeeMines} />
      <style>{`
        section.board {
          grid-template-columns: repeat(${board[0].length}, 1fr);
        }
      `}</style>
    </section>
  )
}

const getCellText = (board, x, y) => {
  if (!isRevealed(board[y][x]) || hasMine(board[y][x]))
    return ''
  const surroundingMineCount = getSurroundingMineCount(board, x, y)
  if (surroundingMineCount < 1)
    return ''
  return surroundingMineCount
}

const Toolbar = ({ cheatSeeMines, onCheatSeeMines }) => (
  <section className="toolbar">
    <div className="checkbox">
      <input id="cheat-see-mines" type="checkbox" value={cheatSeeMines} onChange={() => onCheatSeeMines(!cheatSeeMines)} />
      <label htmlFor="cheat-see-mines">Cheat: See Mines</label>
    </div>
  </section>
)
