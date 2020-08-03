import { DateTime } from 'luxon'
import React, { useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

import './Games.css'
import {useAuth0} from '@auth0/auth0-react'

export const Games = ({ apiClient }) => {
  const [games, setGames] = useState([])
  const history = useHistory()

  useEffect(() => {
    if (!apiClient)
      return
    apiClient.getGames().then(setGames)
  }, [apiClient])

  const onNewGame = () => {
    const id = uuid()
    apiClient.createGameAndGet({
      id,
      width: 16,
      height: 16,
      mineCount: 40,
    }).then(() => {
      history.push(`/play/online/${id}`)
    })
  }

  return (
    <section className={`games ${ apiClient ? 'signed-in' : 'signed-out' }`}>
      { !apiClient && <SignedOut/> }
      { apiClient && <SignedIn onNewGame={onNewGame} games={games}/> }
    </section>
  )
}

const SignedIn = ({ onNewGame, games }) => (
  <>
    <div>
      <button onClick={onNewGame}>New Game</button>
    </div>
    <ul>
      { games.map(game => <Game game={game}/>)}
    </ul>
  </>
)

const SignedOut = () => {
  const { loginWithRedirect } = useAuth0()

  return (
    <>
      <p>
        You need to log in or sign up in order to play online. It only takes a few seconds.
      </p>
      <button onClick={() => loginWithRedirect()}>Log In / Sign Up</button>
    </>
  )
}

const Game = ({ game }) => {
  const time = durationAgo(game.creationDate)
  const status = game.won ? 'Won' : game.lost ? 'Lost' : 'Started'
  return (
    <li>
      <div>Size: { game.width } x { game.height }</div>
      <div>Mines: { game.mineCount }</div>
      <div>Status: { status }</div>
      <div>Started: { time }</div>
      <Link to={'/play/online/' + game.id}>{ status === 'Started' ? 'Play' : 'Open' }</Link>
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
