import { useAuth0 } from "@auth0/auth0-react";
import { DateTime } from 'luxon'
import React, { useState, useEffect, useRef } from 'react'

import {
  CellValue,
  isUnknown,
  toggleFlag,
  getFlagCount,
  getSurroundingFlagCount,
  getSurroundingMineCount,
  isWon,
  makeBoard,
  mapBoard,
  reveal,
  sweep,
} from '@taros-minesweeper/lib'

import './App.css';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button onClick={() => loginWithRedirect()}>Log In</button>;
};


const getCellText = (board, x, y) => {
  if (board[y][x] !== CellValue.KnownClear)
    return ''
  const surroundingMineCount = getSurroundingMineCount(board, x, y)
  if (surroundingMineCount < 1)
    return ''
  return surroundingMineCount
}

// import {Nav} from '../../web-next/components/nav'

const Profile = () => {
  const { user, isAuthenticated } = useAuth0();

  console.log('Profile', isAuthenticated, user)

  return (
    isAuthenticated && (
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
};

export default function App() {
  const [boardWidth, setBoardWidth] = useState(16)
  const [boardHeight, setBoardHeight] = useState(16)
  const [boardMineCount, setBoardMineCount] = useState(40)
  const [board, setBoard] = useState(makeBoard(boardWidth, boardHeight, boardMineCount))
  const [lostPosition, setLostPosition] = useState(null)
  const [sweeperPosition, setSweeperPosition] = useState(null)
  const [cheatSeeMines, setCheatSeeMines] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [gameDuration, setGameDuration] = useState(null)
  const [flagCount, setFlagCount] = useState(0)
  const [won, setWon] = useState(false)
  const gameDurationTimer = useRef(null)

  useEffect(() => {
    setFlagCount(getFlagCount(board))
    if (isWon(board))
      win()
  }, [board])

  const setCell = (x, y, value) => setBoard(mapBoard(board, (x2, y2, value2) => (
    x === x2 && y === y2
      ? value
      : value2
  )))

  const startTimeTracker = () => {
    const startTime = DateTime.utc()
    setStartTime(startTime)
    gameDurationTimer.current = setInterval(() => {
      setGameDuration(startTime.diffNow().negate().toFormat('mm:ss'))
    }, 1000)
  }

  const stopTimeTracker = () => {
    clearInterval(gameDurationTimer.current)
    gameDurationTimer.current = null
  }

  const lose = (losePosition) => {
    stopTimeTracker()
    setLostPosition(losePosition)
  }

  const win = () => {
    stopTimeTracker()
    setWon(true)
  }

  const onClick = (x, y, value) => {
    if (won || lostPosition)
      return

    if (value === CellValue.UnknownClear) {
      if (startTime === null)
        startTimeTracker()
      setBoard(reveal(board, x, y))
    } else if (value === CellValue.UnknownMine) {
      lose({ x, y })
    }
  }

  const onContextMenu = (x, y) => (event) => {
    event.preventDefault()

    if (won || lostPosition)
      return

    if (!isUnknown(board[y][x]))
      return

    setCell(x, y, toggleFlag(board[y][x]))
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

    if (event.button !== 0 || board[y][x] !== CellValue.KnownClear)
      return

    const surroundingMineCount = getSurroundingMineCount(board, x, y)

    if (!surroundingMineCount)
      return

    const surroundingFlagCount = getSurroundingFlagCount(board, x, y)

    if (surroundingMineCount !== surroundingFlagCount)
      return

    const { losePosition, board: newBoard } = sweep(board, x, y)

    if (losePosition) {
      lose(losePosition)
    } else {
      setBoard(newBoard)
    }
  }

  const onReset = () => {
    stopTimeTracker()
    setLostPosition(null)
    setWon(false)
    setStartTime(null)
    setGameDuration(null)
    setBoard(makeBoard(boardWidth, boardHeight))
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
    if (lostPosition && value === CellValue.UnknownMine )
      return 'mine'
    if (!lostPosition && value === CellValue.UnknownMine)
      return cheatSeeMines ? 'unknown mine' : 'unknown'
    if (value === CellValue.KnownClear)
      return 'clear'
    if (value === CellValue.UnknownClearFlag || value === CellValue.UnknownMineFlag)
      return 'unknown flag'
    return 'unknown'
  }

  const getSmileyClass = () => {
    if (lostPosition)
      return 'lost'
    if (sweeperPosition)
      return 'wondering'
    if (won)
      return 'won'
    return ''
  }

  return (
    <div className="container">
      <section className="game">
        <LoginButton/>
        <Profile/>
        <section className="top-bar">
          <div><span className="dseg">{boardMineCount - flagCount}</span></div>
          <div onClick={onReset} className={'smile ' + getSmileyClass()}></div>
          <div><span className="dseg">{gameDuration || '00:00'}</span></div>
        </section>
        <section className="board">
          {
            board.map((columnCells, y) => (
              columnCells.map((cell, x) => (
                <div
                  key={`${x}, ${y}`}
                  title={`(${x}, ${y}) ${cell}`}
                  onClick={() => onClick(x, y, cell)}
                  onContextMenuCapture={onContextMenu(x, y)}
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
        <section className="toolbar">
          <div className="checkbox">
            <input id="cheat-see-mines" type="checkbox" value={cheatSeeMines} onChange={() => setCheatSeeMines(!cheatSeeMines)} />
            <label htmlFor="cheat-see-mines">Cheat: See Mines</label>
          </div>
        </section>
      </section>

      <style jsx global>{`
        body {
          background-image: url(/wallpapers/${Math.floor(Math.random() * 5) + 1}.png);
        }
        section.board {
          display: grid;
          grid-template-columns: repeat(${boardWidth}, 1fr);
        }
      `}</style>
    </div>
  )
}
