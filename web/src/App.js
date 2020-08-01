import { useAuth0 } from "@auth0/auth0-react";
import React, { useState, useEffect } from 'react'

import './App.css';

import { ClientMinesweeper } from './components/ClientMinesweeper'
import { Nav } from './components/Nav'

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button onClick={() => loginWithRedirect()}>Log In</button>;
};

const Profile = () => {
  const { user, isAuthenticated } = useAuth0();

  console.log('Profile', isAuthenticated, user)

  return (
    isAuthenticated && (
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
};

export default function App() {
  const [background, setBackground] = useState(0)
  const [cheatSeeMines, setCheatSeeMines] = useState(false)
  const [version, setVersion] = useState('client')

  useEffect(() => {
    switchBackground()
  }, [])

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
        <LoginButton/>
        <Profile/>
        <Nav version={version} onVersion={setVersion}/>
        <ClientMinesweeper
          cheatSeeMines={cheatSeeMines}
        />
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
