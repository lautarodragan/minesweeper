import { useAuth0 } from '@auth0/auth0-react'
import React, {useState} from 'react'
import { useHistory } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

import './NewGame.css'

export const NewGame = ({ apiClient }) => {
  const history = useHistory()
  const [mode, setMode] = useState('offline')
  const [mines, setMines] = useState(5)
  const [width, setWidth] = useState(5)
  const [height, setHeight] = useState(5)
  const authRequired = mode === 'online' && !apiClient

  const onClick = () => {
    if (mode === 'offline') {
      history.push(`/play/offline?mines=${mines}&width=${width}&height=${height}`)
    } else {
      const id = uuid()
      apiClient.createGameAndGet({
        id,
        width: parseInt(width),
        height: parseInt(height),
        mineCount: parseInt(mines),
      }).then(() => {
        history.push(`/play/online/${id}`)
      })
    }
  }

  return (
    <section className="new-game">
      <div className="mode">
        <div className={mode === 'offline' ? 'active' : ''} onClick={() => setMode('offline')}>Play Offline</div>
        <div className={mode === 'online' ? 'active' : ''} onClick={() => setMode('online')}>Play Online</div>
      </div>
      <ModeDescription mode={mode} isLoggedIn={!!apiClient} />
      { !authRequired && <Difficulty
        mines={mines}
        onMines={setMines}
        width={width}
        onWidth={setWidth}
        height={height}
        onHeight={setHeight}
      />}
      { !authRequired && <button className="start" onClick={onClick}>Start</button>}
    </section>
  )
}

const ModeDescription = ({ mode, isLoggedIn }) => (
  <div className="mode-description">
    { mode === 'offline' ? <ModeDescriptionOffLine/> : <ModeDescriptionOnLine isLoggedIn={isLoggedIn}/>}
  </div>
)

const ModeDescriptionOffLine = () => (
  <p>Offline games are quick and require no sign up, but aren't saved and don't count towards your score.</p>
)

const ModeDescriptionOnLine = ({ isLoggedIn }) => {
  const { loginWithRedirect } = useAuth0()

  return (
    <>
      <p>Online games are saved automatically and count towards your score.</p>
      { !isLoggedIn && <>
        <p>
          You need to log in or sign up in order to play online. It only takes a few seconds.
        </p>
        <button onClick={() => loginWithRedirect()}>Log In / Sign Up</button>
      </>}
    </>
  )
}

const Difficulty = ({
  mines,
  onMines,
  width,
  onWidth,
  height,
  onHeight,
}) => (
  <div className="difficulty">
    <div>
      <span>Mines:</span>
      <input type="number" min={5} max={900} value={mines} onChange={(event) => onMines(event.currentTarget.value)} />
    </div>
    <div>
      <span>Size:</span>
      <input type="number" min={5} max={100} value={width} onChange={(event) => onWidth(event.currentTarget.value)} />
      <span> by </span>
      <input type="number" min={5} max={100} value={height} onChange={(event) => onHeight(event.currentTarget.value)} />
    </div>
  </div>
)
