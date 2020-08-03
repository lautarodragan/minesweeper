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
      <div className="mode-description"></div>
      <div className="difficulty">
        <div>
          <span>Mines:</span>
          <input type="number" min={5} max={900} value={mines} onChange={(event) => setMines(event.currentTarget.value)} />
        </div>
        <div>
          <span>Size:</span>
          <input type="number" min={5} max={100} value={width} onChange={(event) => setWidth(event.currentTarget.value)} />
          <span> by </span>
          <input type="number" min={5} max={100} value={height} onChange={(event) => setHeight(event.currentTarget.value)} />
        </div>
      </div>
      <button className="start" onClick={onClick}>Start</button>
    </section>
  )
}

