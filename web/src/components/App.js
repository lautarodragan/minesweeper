import { useAuth0 } from '@auth0/auth0-react'
import React, { useState, useEffect } from 'react'

import './App.css'

import { ApiClient } from '../ApiClient'

import { ClientMinesweeper } from './ClientMinesweeper'
import { Nav } from './Nav'
import { ServerMinesweeper } from './ServerMinesweeper'

export default function App() {
  const [background, setBackground] = useState(0)
  const [cheatSeeMines, setCheatSeeMines] = useState(false)
  const [version, setVersion] = useState('client')
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
    console.log('accessToken', accessToken)
  }, [accessToken])

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
    <div className="container" onClick={onContainerClick}>
      <section className="game">
        <Nav version={version} onVersion={setVersion}/>
        {
          version === 'client'
            ? <ClientMinesweeper cheatSeeMines={cheatSeeMines} />
            : <ServerMinesweeper apiClient={apiClient} cheatSeeMines={cheatSeeMines} />
        }
        <Toolbar cheatSeeMines={cheatSeeMines} onCheatSeeMines={setCheatSeeMines} />
      </section>

      <style>{`
        body {
          background-image: url(/wallpapers/${background}.png);
        }
      `}</style>
    </div>
  )
}

const Toolbar = ({ cheatSeeMines, onCheatSeeMines }) => (
  <section className="toolbar">
    <div className="checkbox">
      <input id="cheat-see-mines" type="checkbox" value={cheatSeeMines} onChange={() => onCheatSeeMines(!cheatSeeMines)} />
      <label htmlFor="cheat-see-mines">Cheat: See Mines</label>
    </div>
  </section>
)
