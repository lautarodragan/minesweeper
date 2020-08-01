import {
  CellValue,
  getFlagCount,
  getSurroundingFlagCount,
  getSurroundingMineCount,
  isUnknown,
  isWon,
  makeBoard,
  mapBoard,
  reveal,
  sweep,
  toggleFlag,
} from '@taros-minesweeper/lib'
import { DateTime } from 'luxon'
import React, {useEffect, useRef, useState} from 'react'

import { Minesweeper } from './Minesweeper'

export const ClientMinesweeper = ({ cheatSeeMines }) => {
  const [boardWidth, setBoardWidth] = useState(16)
  const [boardHeight, setBoardHeight] = useState(16)
  const [boardMineCount, setBoardMineCount] = useState(40)
  const [board, setBoard] = useState(makeBoard(boardWidth, boardHeight, boardMineCount))
  const [lostPosition, setLostPosition] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [gameDuration, setGameDuration] = useState(null)
  const [flagCount, setFlagCount] = useState(0)
  const [won, setWon] = useState(false)
  const gameDurationTimer = useRef(null)

  useEffect(() => {
    setFlagCount(getFlagCount(board))
    if (isWon(board)) {
      stopTimeTracker()
      setWon(true)
    }
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
  )
}
