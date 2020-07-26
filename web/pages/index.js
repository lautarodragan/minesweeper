import Head from 'next/head'
import dynamic from "next/dynamic";

const NoSsr = dynamic(() => Promise.resolve(({ children }) => <>{children}</>), {
  ssr: false
})

import React, { useState } from 'react'

const boardWidth = 16
const boardHeight = 16

const CELL_UNKNOWN_CLEAR = 0
const CELL_UNKNOWN_MINE = 1
const CELL_KNOWN_CLEAR = 2
const CELL_KNOWN_MINE = 3

const makeEmptyBoard = (width, height) => Array(width).fill(null).map(y => Array(height).fill(CELL_UNKNOWN_CLEAR))

const mapBoard = (board, callback) => board.map((columnCells, y) => columnCells.map((cell, x) => callback(x, y, cell)))

const makeMines = (width, height, mineCount) => {
  const mines = []

  while (mines.length < mineCount) {
    let newMine

    while (!newMine || mines.find(mine => mine.x === newMine.x && mine.y === newMine.y)) {
      newMine = {
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
      }
    }

    mines.push(newMine)
  }

  return mines
}

const makeBoard = (width, height, mineCount = 40) => {
  const mines = makeMines(width, height, mineCount)

  return mapBoard(
    makeEmptyBoard(width, height),
    (x, y) => mines.some(mine => mine.x === x && mine.y === y) ? CELL_UNKNOWN_MINE : CELL_UNKNOWN_CLEAR,
  )
}

const getSurroundingMineCount = (board, x, y) => {
  let sum = 0
  for (let j = Math.max(0, y - 1); j < Math.min(board.length, j + 1); j++)
    for (let i = Math.max(0, x - 1); i < Math.min(board[0].length, x + 1); i++)
      if (x !== i && y !== j && [CELL_UNKNOWN_MINE, CELL_KNOWN_MINE].includes(board[j][i]))
        sum++;
  return sum
}

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
  const [magicPosition, setMagicPosition] = useState(null)

  const setCell = (x, y, value) => setBoard(mapBoard(board, (x2, y2, value2) => (
    x === x2 && y === y2
      ? value
      : value2
  )))

  const onClick = (x, y, value) => {
    console.log('Clicked on cell at ', x, y, value)

    if (lostPosition) {
      console.log('You are dead already!')
      return
    }

    if (value === CELL_UNKNOWN_CLEAR) {
      console.log('We are fine!')
      setCell(x, y, CELL_KNOWN_CLEAR)
    } else if (value === CELL_UNKNOWN_MINE) {
      console.log('Bang!')
      setCell(x, y, CELL_KNOWN_MINE)
      setLostPosition({ x, y })
    }
  }

  const onContextMenu = (event) => {
    event.preventDefault()
  }

  const onMouseDown = (x, y, value) => (event) => {
    event.preventDefault()
    if (event.buttons === 3)
      setMagicPosition({ x, y })
  }

  const onMouseMove = (x, y, value) => (event) => {
    event.preventDefault()
    if (event.buttons === 3)
      setMagicPosition({ x, y })
  }

  const onMouseUp = (x, y, value) => (event) => {
    event.preventDefault()
    setMagicPosition(null)
  }

  const getClassNameForCell = (x, y, value) => {
    if (lostPosition && lostPosition.x === x && lostPosition.y === y)
      return 'lost'
    if (magicPosition && magicPosition.x >= x - 1 && magicPosition.x <= x + 1 && magicPosition.y >= y - 1 && magicPosition.y <= y + 1)
      return 'clear'
    if (lostPosition && value === CELL_UNKNOWN_MINE )
      return 'mine'
    if (!lostPosition && value === CELL_UNKNOWN_MINE)
      return 'unknown mine'
    if (value === CELL_KNOWN_CLEAR)
      return 'clear'
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
                  onContextMenuCapture={onContextMenu}
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
