import Head from 'next/head'
import dynamic from 'next/dynamic'
import React, { useState } from 'react'

import {
  CELL_KNOWN_CLEAR,
  CELL_KNOWN_MINE,
  CELL_UNKNOWN_CLEAR,
  CELL_UNKNOWN_CLEAR_FLAG,
  CELL_UNKNOWN_MINE,
  CELL_UNKNOWN_MINE_FLAG
} from './cell'
import {getSurroundingFlagCount, getSurroundingMineCount, makeBoard, mapBoard} from './board'
import { recursiveSolve } from './solve'
import { sweep, getSweepLosePosition } from './sweep'

const NoSsr = dynamic(() => Promise.resolve(({ children }) => <>{children}</>), {
  ssr: false
})

const boardWidth = 16
const boardHeight = 16

const getCellText = (board, x, y) => {
  if (board[y][x] !== CELL_KNOWN_CLEAR)
    return ''
  const surroundingMineCount = getSurroundingMineCount(board, x, y)
  if (surroundingMineCount < 1)
    return ''
  return surroundingMineCount
}

export default function Home() {
  const [board, setBoard] = useState(makeBoard(boardWidth, boardHeight))
  const [lostPosition, setLostPosition] = useState(null)
  const [sweeperPosition, setSweeperPosition] = useState(null)
  const [cheatSeeMines, setCheatSeeMines] = useState(false)

  const setCell = (x, y, value) => setBoard(mapBoard(board, (x2, y2, value2) => (
    x === x2 && y === y2
      ? value
      : value2
  )))

  const onClick = (x, y, value) => {
    if (lostPosition) {
      return
    }

    if (value === CELL_UNKNOWN_CLEAR) {
      setBoard(recursiveSolve(board, x, y))
    } else if (value === CELL_UNKNOWN_MINE) {
      setCell(x, y, CELL_KNOWN_MINE)
      setLostPosition({ x, y })
    }
  }

  const onContextMenu = (x, y) => (event) => {
    event.preventDefault()
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
    if (event.buttons === 3)
      setSweeperPosition({ x, y })
  }

  const onMouseMove = (x, y, value) => (event) => {
    event.preventDefault()
    if (event.buttons === 3)
      setSweeperPosition({ x, y })
  }

  const onMouseUp = (x, y, value) => (event) => {
    event.preventDefault()
    setSweeperPosition(null)

    if (event.button !== 0 || board[y][x] !== CELL_KNOWN_CLEAR)
      return

    const surroundingMineCount = getSurroundingMineCount(board, x, y)

    if (!surroundingMineCount)
      return

    const surroundingFlagCount = getSurroundingFlagCount(board, x, y)

    if (surroundingMineCount !== surroundingFlagCount)
      return

    const losePosition = getSweepLosePosition(board, x, y)

    if (losePosition) {
      setLostPosition(losePosition)
    } else {
      const newBoard = sweep(board, x, y)
      setBoard(newBoard)
    }
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

  return (
    <div className="container">
      <Head>
        <title>Minesweeper</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NoSsr>
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

      <style jsx>{`
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

        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }
      `}</style>

      <style jsx global>{`
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
