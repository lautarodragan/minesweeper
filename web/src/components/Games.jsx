import { useAuth0 } from '@auth0/auth0-react'
import { DateTime } from 'luxon'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import './Games.css'

export const Games = ({ apiClient }) => {
  const [games, setGames] = useState([])

  useEffect(() => {
    if (!apiClient)
      return
    apiClient.getGames().then(setGames)
  }, [apiClient])

  return (
    <section className={`games ${ apiClient ? 'signed-in' : 'signed-out' }`}>
      { !apiClient && <SignedOut/> }
      { apiClient && <SignedIn games={games}/> }
    </section>
  )
}

const SignedIn = ({ games }) => (
  <ul>
    { games.map(game => <Game game={game}/>)}
  </ul>
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
      { status !== 'Started' && <div>Duration: {duration(game.creationDate, game.endDate)}</div> }
      <Link to={'/play/online/' + game.id}>{ status === 'Started' ? 'Play' : 'Open' }</Link>
    </li>
  )
}

const duration = (start, end) => {
  const duration = DateTime.fromISO(start).diff(DateTime.fromISO(end)).negate().shiftTo('minutes', 'seconds').toObject()
  return `${Math.floor(duration.minutes)}m ${Math.floor(duration.seconds)}s`
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
