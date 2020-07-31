import { DateTime } from 'luxon'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import React, { useState, useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'

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

const NoSsr = dynamic(() => Promise.resolve(({ children }) => <>{children}</>), {
  ssr: false
})

const getCellText = (board, x, y) => {
  if (board[y][x] !== CellValue.KnownClear)
    return ''
  const surroundingMineCount = getSurroundingMineCount(board, x, y)
  if (surroundingMineCount < 1)
    return ''
  return surroundingMineCount
}

async function createGame(game) {
  await fetch(`http://localhost:8000/games`, {
    method: 'post',
    body: JSON.stringify(game),
    headers: {
      'content-type': 'application/json',
    },
  })
  const gameResponse = await fetch(`http://localhost:8000/games/${game.id}`)
  return gameResponse.json()
}

async function setCell(gameId, x, y, value) {
  await fetch(`http://localhost:8000/games/${gameId}/cells/${x},${y}`, {
    method: 'put',
    body: JSON.stringify({
      value,
    }),
    headers: {
      'content-type': 'application/json',
    },
  })
  const gameResponse = await fetch(`http://localhost:8000/games/${gameId}`)
  return gameResponse.json()
}

export default function Home() {
  const [boardWidth, setBoardWidth] = useState(16)
  const [boardHeight, setBoardHeight] = useState(16)
  const [boardMineCount, setBoardMineCount] = useState(40)
  const [board, setBoard] = useState(null)
  const [lostPosition, setLostPosition] = useState(null)
  const [sweeperPosition, setSweeperPosition] = useState(null)
  const [cheatSeeMines, setCheatSeeMines] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [gameDuration, setGameDuration] = useState(null)
  const [flagCount, setFlagCount] = useState(0)
  const [won, setWon] = useState(false)
  const gameDurationTimer = useRef(null)
  const [game, setGame] = useState(null)

  useEffect(() => {
    onReset()
  }, [])

  useEffect(() => {
    console.log('game changed', game)
    if (!game)
      return
    setBoard(game.board)
    if (game.won)
      win()
    if (game.lost)
      lose(game.lostPosition)
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

  const lose = (losePosition) => {
    stopTimeTracker()
    setLostPosition(losePosition)
  }

  const win = () => {
    stopTimeTracker()
    setWon(true)
  }

  const onClick = (x, y, value) => {
    if (game.won || game.lost)
      return

    if (startTime === null)
      startTimeTracker()
    setCell(game.id, x, y, CellValue.KnownClear).then(setGame)
  }

  const onContextMenu = (x, y) => (event) => {
    event.preventDefault()

    if (won || lostPosition)
      return

    if (!isUnknown(board[y][x]))
      return

    setCell(game.id, x, y, CellValue.UnknownMineFlag).then(setGame)
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
    createGame({
      id: uuid(),
      width: boardWidth,
      height: boardHeight,
      mineCount: boardMineCount,
    }).then(setGame)
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
              board && board.map((columnCells, y) => (
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
