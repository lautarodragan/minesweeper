import React, { useState, useEffect } from 'react'

import './Games.css'

export const Games = ({ apiClient }) => {
  const [games, setGames] = useState([])

  useEffect(() => {
    if (!apiClient)
      return
    apiClient.getGames().then(setGames)
  }, [apiClient])

  return (
    <ul className="games">
      { games.map(game => <Game game={game}/>)}
    </ul>
  )
}

const Game = ({ game }) => (
  <li>
    <div>Size: { game.width } x { game.height }</div>
    <div>Mines: { game.mineCount }</div>
    <div>Status: { game.won ? 'Won' : game.lost ? 'Lost' : 'Started' }</div>
  </li>
)
