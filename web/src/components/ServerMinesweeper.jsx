import React, { useEffect, useRef, useState } from 'react'
import {
  CellValue,
  getFlagCount,
  isUnknown,
} from '@taros-minesweeper/lib'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'

import { Minesweeper } from './Minesweeper'

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000'

console.log({ apiUrl })

async function createGame(game, accessToken) {
  await fetch(`${apiUrl}/games`, {
    method: 'post',
    body: JSON.stringify(game),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const gameResponse = await fetch(`${apiUrl}/games/${game.id}`, { headers: { Authorization: `Bearer ${accessToken}` }})
  return gameResponse.json()
}

async function setCell(gameId, x, y, value, accessToken) {
  await fetch(`${apiUrl}/games/${gameId}/cells/${x},${y}`, {
    method: 'put',
    body: JSON.stringify({
      value,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const gameResponse = await fetch(`${apiUrl}/games/${gameId}`, { headers: { Authorization: `Bearer ${accessToken}` } })
  return gameResponse.json()
}

export const ServerMinesweeper = ({ accessToken, cheatSeeMines }) => {
  const [boardWidth, setBoardWidth] = useState(16)
  const [boardHeight, setBoardHeight] = useState(16)
  const [boardMineCount, setBoardMineCount] = useState(40)
  const [startTime, setStartTime] = useState(null)
  const [gameDuration, setGameDuration] = useState(null)
  const [flagCount, setFlagCount] = useState(0)
  const gameDurationTimer = useRef(null)
  const [game, setGame] = useState(null)

  useEffect(() => {
    onReset()
  }, [])

  useEffect(() => {
    if (!game)
      return
    setFlagCount(getFlagCount(game.board))
    if (game.won || game.lost) {
      stopTimeTracker()
    }
  }, [game])

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

  const onReveal = (x, y, value) => {
    if (game.won || game.lost)
      return

    if (value === CellValue.UnknownClear || value === CellValue.UnknownMine) {
      if (startTime === null)
        startTimeTracker()
      setCell(game.id, x, y, CellValue.KnownClear, accessToken).then(setGame)
    }
  }

  const onSweep = (x, y, value) => {
    setCell(game.id, x, y, CellValue.KnownClear, accessToken).then(setGame)
  }

  const onFlag = (x, y) => (event) => {
    event.preventDefault()

    if (game.won || game.lost)
      return

    if (!isUnknown(game.board[y][x]))
      return

    setCell(game.id, x, y, CellValue.UnknownMineFlag, accessToken).then(setGame)
  }

  const onReset = () => {
    stopTimeTracker()
    setStartTime(null)
    setGameDuration(null)
    createGame({
      id: uuid(),
      width: boardWidth,
      height: boardHeight,
      mineCount: boardMineCount,
    }, accessToken).then(setGame)
  }

  return (
      game
        ? (
          <Minesweeper
            board={game.board}
            mineCount={boardMineCount}
            flagCount={flagCount}
            won={game.won}
            lostPosition={game.lostPosition}
            cheatSeeMines={cheatSeeMines}
            gameDuration={gameDuration}
            onReset={onReset}
            onReveal={onReveal}
            onSweep={onSweep}
            onFlag={onFlag}
          />
        )
      : <div>Loading...</div>
  )
}
