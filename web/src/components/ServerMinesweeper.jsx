import React, { useEffect, useRef, useState } from 'react'
import {
  CellValue,
  getFlagCount,
  isUnknown,
} from '@taros-minesweeper/lib'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'

import { Minesweeper } from './Minesweeper'

export const ServerMinesweeper = ({ apiClient, cheatSeeMines }) => {
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
      apiClient.setCellAndGet(game.id, x, y, CellValue.KnownClear).then(setGame)
    }
  }

  const onSweep = (x, y, value) => {
    apiClient.setCellAndGet(game.id, x, y, CellValue.KnownClear).then(setGame)
  }

  const onFlag = (x, y) => (event) => {
    event.preventDefault()

    if (game.won || game.lost)
      return

    if (!isUnknown(game.board[y][x]))
      return

    apiClient.setCellAndGet(game.id, x, y, CellValue.UnknownMineFlag).then(setGame)
  }

  const onReset = () => {
    stopTimeTracker()
    setStartTime(null)
    setGameDuration(null)
    apiClient.createGameAndGet({
      id: uuid(),
      width: boardWidth,
      height: boardHeight,
      mineCount: boardMineCount,
    }).then(setGame)
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
