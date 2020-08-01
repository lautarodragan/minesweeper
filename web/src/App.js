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
import {Minesweeper} from './components/Minesweeper'

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button onClick={() => loginWithRedirect()}>Log In</button>;
};

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
  const [cheatSeeMines, setCheatSeeMines] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [gameDuration, setGameDuration] = useState(null)
  const [flagCount, setFlagCount] = useState(0)
  const [won, setWon] = useState(false)
  const gameDurationTimer = useRef(null)
  const [background, setBackground] = useState(0)

  useEffect(() => {
    switchBackground()
  }, [])

  useEffect(() => {
    setFlagCount(getFlagCount(board))
    if (isWon(board)) {
      stopTimeTracker()
      setWon(true)
    }
  }, [board])

  const switchBackground = () => {
    setBackground(Math.floor(Math.random() * 5) + 1)
  }

  const onContainerClick = (event) => {
    if (event.target !== event.currentTarget)
      return
    switchBackground()
  }

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

  const onReveal = (x, y, value) => {
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

  const onSweep = (x, y, value) => {
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

  const onFlag = (x, y) => (event) => {
    event.preventDefault()

    if (won || lostPosition)
      return

    if (!isUnknown(board[y][x]))
      return

    setCell(x, y, toggleFlag(board[y][x]))
  }

  const onReset = () => {
    stopTimeTracker()
    setLostPosition(null)
    setWon(false)
    setStartTime(null)
    setGameDuration(null)
    setBoard(makeBoard(boardWidth, boardHeight))
  }

  return (
    <div className="container" onClick={onContainerClick}>
      <section className="game">
        <LoginButton/>
        <Profile/>
        <Minesweeper
          board={board}
          mineCount={boardMineCount}
          flagCount={flagCount}
          won={won}
          lostPosition={lostPosition}
          cheatSeeMines={cheatSeeMines}
          gameDuration={gameDuration}
          onReset={onReset}
          onReveal={onReveal}
          onSweep={onSweep}
          onFlag={onFlag}
        />
        <section className="toolbar">
          <div className="checkbox">
            <input id="cheat-see-mines" type="checkbox" value={cheatSeeMines} onChange={() => setCheatSeeMines(!cheatSeeMines)} />
            <label htmlFor="cheat-see-mines">Cheat: See Mines</label>
          </div>
        </section>
      </section>

      <style jsx global>{`
        body {
          background-image: url(/wallpapers/${background}.png);
        }
        section.board {
          display: grid;
          grid-template-columns: repeat(${boardWidth}, 1fr);
        }
      `}</style>
    </div>
  )
}
