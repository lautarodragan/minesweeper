import { useAuth0 } from '@auth0/auth0-react'
import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'

import './App.css'

import { ApiClient } from '../ApiClient'

import { ClientMinesweeper } from './ClientMinesweeper'
import { Nav } from './Nav'
import { ServerMinesweeper } from './ServerMinesweeper'
import { Games } from './Games'

export default function App() {
  const [background, setBackground] = useState(0)
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [accessToken, setAccessToken] = useState('')
  const [apiClient, setApiClient] = useState(null)

  useEffect(() => {
    switchBackground()
  }, [])

  useEffect(() => {
    if (isAuthenticated)
      getAccessTokenSilently().then(setAccessToken)
  }, [isAuthenticated])

  useEffect(() => {
    setApiClient(
      accessToken
        ? ApiClient({ url: process.env.REACT_APP_API_URL || 'http://localhost:8000', accessToken })
        : null
    )
  }, [accessToken])

  const switchBackground = () => {
    setBackground(Math.floor(Math.random() * 5) + 1)
  }

  const onContainerClick = (event) => {
    if (event.target !== event.currentTarget)
      return
    switchBackground()
  }

  return (
    <Router>
      <div className="container" onClick={onContainerClick}>
        <section className="game">
          <Nav/>
          <Switch>
            <Route path="/play/offline">
              <ClientMinesweeper />
            </Route>
            <Route path="/play/online/:id">
              <ServerMinesweeper apiClient={apiClient} />
            </Route>
            <Route path="/play/online">
              <Games apiClient={apiClient} />
            </Route>
            <Route>
              <section className="home">
                Taro's Minesweeper! You can play offline and online!
              </section>
            </Route>
          </Switch>
        </section>

        <style>{`
          body {
            background-image: url(/wallpapers/${background}.png);
          }
        `}</style>
      </div>
    </Router>
  )
}
