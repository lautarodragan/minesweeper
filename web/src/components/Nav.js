import { useAuth0 } from '@auth0/auth0-react'
import React from 'react'

import './Nav.css'

export const Nav = ({ version, onVersion, onMyGames }) => {
  const { isAuthenticated, user } = useAuth0()

  return (
    <nav>
      { !isAuthenticated && <LoginButton /> }
      { isAuthenticated && <Profile user={user} /> }
      <div>
        <div>
          <span className={ version === 'client' ? 'active' : ''} onClick={() => onVersion('client')} >Play Client-Only Version</span>
          <span className={ version === 'server' ? 'active' : ''} onClick={() => onVersion('server')} >Play Server Version</span>
        </div>
        <div>
          <span onClick={() => onMyGames()} >My Games</span>
        </div>
      </div>
    </nav>
  )
}

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0()
  return <button onClick={() => loginWithRedirect()}>Log In</button>
}

const LogoutButton = () => {
  const { logout } = useAuth0()
  return <button onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>
}

const Profile = ({ user }) => {
  return (
    <div className="profile">
      <img src={user.picture} alt={user.name} />
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <LogoutButton />
      </div>
    </div>
  )
}
