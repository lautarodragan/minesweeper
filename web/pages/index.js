import { DateTime } from 'luxon'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import React, { useState, useEffect, useRef } from 'react'

import {
  CELL_KNOWN_CLEAR,
  CELL_KNOWN_MINE,
  CELL_UNKNOWN_CLEAR,
  CELL_UNKNOWN_CLEAR_FLAG,
  CELL_UNKNOWN_MINE,
  CELL_UNKNOWN_MINE_FLAG,
  getFlagCount,
  getSurroundingFlagCount,
  getSurroundingMineCount,
  isWon,
  makeBoard,
  mapBoard,
  recursiveSolve,
  sweep,
} from '@taros-minesweeper/lib'

const NoSsr = dynamic(() => Promise.resolve(({ children }) => <>{children}</>), {
  ssr: false
})

const getCellText = (board, x, y) => {
  if (board[y][x] !== CELL_KNOWN_CLEAR)
    return ''
  const surroundingMineCount = getSurroundingMineCount(board, x, y)
  if (surroundingMineCount < 1)
    return ''
  return surroundingMineCount
}

export default function Home() {
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

    if (value === CELL_UNKNOWN_CLEAR) {
      if (startTime === null)
        startTimeTracker()
      setBoard(recursiveSolve(board, x, y))
    } else if (value === CELL_UNKNOWN_MINE) {
      lose({ x, y })
    }
  }

  const onContextMenu = (x, y) => (event) => {
    event.preventDefault()

    if (won || lostPosition)
      return

    if (board[y][x] === CELL_UNKNOWN_CLEAR)
      setCell(x, y, CELL_UNKNOWN_CLEAR_FLAG)
    else if (board[y][x] === CELL_UNKNOWN_MINE)
      setCell(x, y, CELL_UNKNOWN_MINE_FLAG)
    else if (board[y][x] === CELL_UNKNOWN_CLEAR_FLAG)
      setCell(x, y, CELL_UNKNOWN_CLEAR)
    else if (board[y][x] === CELL_UNKNOWN_MINE_FLAG)
      setCell(x, y, CELL_UNKNOWN_MINE)
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

    if (event.button !== 0 || board[y][x] !== CELL_KNOWN_CLEAR)
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
    if ((value === CELL_UNKNOWN_MINE || value === CELL_UNKNOWN_CLEAR)
      && sweeperPosition
      && sweeperPosition.x >= x - 1
      && sweeperPosition.x <= x + 1
      && sweeperPosition.y >= y - 1
      && sweeperPosition.y <= y + 1)
      return 'clear'
    if (lostPosition && value === CELL_UNKNOWN_MINE )
      return 'mine'
    if (!lostPosition && value === CELL_UNKNOWN_MINE)
      return cheatSeeMines ? 'unknown mine' : 'unknown'
    if (value === CELL_KNOWN_CLEAR)
      return 'clear'
    if (value === CELL_UNKNOWN_CLEAR_FLAG || value === CELL_UNKNOWN_MINE_FLAG)
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
      <Head>
        <title>Minesweeper</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="game">
        <NoSsr>
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
          <section>
            <div className="checkbox">
              <input id="cheat-see-mines" type="checkbox" value={cheatSeeMines} onChange={() => setCheatSeeMines(!cheatSeeMines)} />
              <label htmlFor="cheat-see-mines">Cheat: See Mines</label>
            </div>
          </section>
        </NoSsr>
      </section>

      <style jsx>{`
        .game {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
        }

        .container {
          display: flex;
          justify-content: center;
        }
        
        .top-bar {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          background-color: #c0c0c0;
          padding: 4px;
        }
        
        .top-bar >div {
          display: flex;
          align-items: center;
        }
        
        .top-bar >div:last-child {
          display: flex;
          justify-content: flex-end;
        }
        
        .top-bar .dseg {
          font-family: "DSEG7 Classic";
          color: red;
          background: black;
          font-size: 2rem;
          padding: 1px;
          margin: 0 4px;
          border-top: 3px solid #808080;
          border-left: 3px solid #808080;
          border-bottom: 3px solid #fff;
          border-right: 3px solid #fff;
        }
      
        div.smile {
          width: 64px;
          height: 64px;
          background-image: url(/smile-normal.png);
          background-size: cover;
          background-color: #c0c0c0;
          border-top: 3px solid #fff;
          border-left: 3px solid #fff;
          border-bottom: 3px solid #808080;
          border-right: 3px solid #808080;
          padding: 6px;
        }
        
        div.smile:active {
          background-image: url(/smile-pressed.png);
          border-top: 3px solid #808080;
          border-left: 3px solid #808080;
          border-bottom: 3px solid #fff;
          border-right: 3px solid #fff;
        }
        
        div.smile.lost {
          background-image: url(/smile-lost.png);
        }
        
        div.smile.wondering {
          background-image: url(/smile-wondering.png);
        }
        
        div.smile.won {
          background-image: url(/smile-won.png);
        }
        
        section.board {
          display: grid;
          grid-template-columns: repeat(${boardWidth}, 1fr);
        }

        section.board div {
          width: 30px;
          height: 30px;
          background-color: #c0c0c0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        section.board div.unknown {
          border-top: 3px solid #fff;
          border-left: 3px solid #fff;
          border-bottom: 3px solid #808080;
          border-right: 3px solid #808080;
        }

        section.board div.unknown:active {
          border: 0.5px solid #808080;
        }

        section.board div.clear {
          border: 0.5px solid #808080;
        }

        section.board div.mine {
          background-image: url(/mine.png);
          background-size: contain;
        }

        section.board div.unknown-mine {
          background-image: url(/mine.png);
          background-size: contain;
        }

        section.board div.lost {
          background-image: url(/mine.png);
          background-size: contain;
          background-color: red;
        }

        section.board div.flag {
          background-image: url(/flag.png);
          background-size: contain;
        }
        
        .checkbox {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <style jsx global>{`
        @font-face {
          font-family: "DSEG7 Classic";
          font-weight: bold;
          src: url("/fonts/DSEG7Classic-Bold.ttf") format("ttf"),
               url("/fonts/DSEG7Classic-Bold.woff") format("woff");
               url("/fonts/DSEG7Classic-Bold.woff2") format("woff2");
        }
      
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
