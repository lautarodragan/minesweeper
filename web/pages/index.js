import Head from 'next/head'
import React, { useState } from 'react'

const boardWidth = 16
const boardHeight = 16

const CELL_UNKNOWN_CLEAR = 0
const CELL_UNKNOWN_MINE = 1
const CELL_KNOWN_CLEAR = 2
const CELL_KNOWN_MINE = 3

const makeEmptyBoard = (width, height) => Array(width).fill(null).map(y => Array(height).fill(CELL_UNKNOWN_CLEAR))

const mapBoard = (board, callback) => board.map((columnCells, y) => columnCells.map((cell, x) => callback(x, y, cell)))

const makeBoard = (width, height, mineChance = .05) => 
  mapBoard(
    makeEmptyBoard(width, height), 
    () => Math.random() < mineChance ? CELL_UNKNOWN_MINE : CELL_UNKNOWN_CLEAR,
  )

const cellStateToClassName = {
  [CELL_UNKNOWN_CLEAR]: 'unknown',
  [CELL_UNKNOWN_MINE]: 'unknown',
  [CELL_KNOWN_CLEAR]: 'clear',
  [CELL_KNOWN_MINE]: 'mine',
}

const cellValueToText = value =>
  value === CELL_UNKNOWN_CLEAR || value === CELL_KNOWN_CLEAR
    ? ''
    : value

export default function Home() {
  const [board, setBoard] = useState(makeBoard(boardWidth, boardHeight))

  const setCell = (x, y, value) => setBoard(mapBoard(board, (x2, y2, value2) => (
    x === x2 && y === y2 
      ? value
      : value2
  )))

  const onClick = (x, y, value) => {
    console.log('Clicked on cell at ', x, y, value)
    if (value === CELL_UNKNOWN_CLEAR) {
      console.log('We are fine!')
      setCell(x, y, CELL_KNOWN_CLEAR)
    } else if (value === CELL_UNKNOWN_MINE) {
      console.log('Bang!')
      setCell(x, y, CELL_KNOWN_MINE)
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Minesweeper</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <section className="board">
          { 
            board.map((columnCells, y) => (
              columnCells.map((cell, x) => (
                <div key={`${x}, ${y}`} title={`(${x}, ${y}) ${cell}`} onClick={() => onClick(x, y, cell)} className={cellStateToClassName[cell]}>{cellValueToText(cell)}</div>
              ))
            ))
          }
        </section>
      </main>

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
