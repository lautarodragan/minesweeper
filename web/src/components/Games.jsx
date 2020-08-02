import { DateTime } from 'luxon'
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

const Game = ({ game }) => {
  const time = durationAgo(game.creationDate)
  return (
    <li>
      <div>Size: { game.width } x { game.height }</div>
      <div>Mines: { game.mineCount }</div>
      <div>Status: { game.won ? 'Won' : game.lost ? 'Lost' : 'Started' }</div>
      <div>Started: { time }</div>
    </li>
  )
}

const durationAgo = (time) => {
  const duration = DateTime.fromISO(time).diffNow().negate()
  if (duration.as('days') > 1)
    return Math.floor(duration.as('days')) + ' days ago'
  if (duration.as('hours') > 1)
    return Math.floor(duration.as('hours')) + ' hours ago'
  if (duration.as('minutes') > 1)
    return Math.floor(duration.as('minutes')) + ' minutes ago'
  if (duration.as('seconds') > 1)
    return Math.floor(duration.as('seconds')) + ' seconds ago'
  return 'now'
}
