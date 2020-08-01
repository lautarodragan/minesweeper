import React from 'react'

import './Nav.css'

export const Nav = ({ version, onVersion }) => {
  return (
    <nav>
      <span className={ version === 'client' ? 'active' : ''} onClick={() => onVersion('client')} >Play Client-Only Version</span>
      <span className={ version === 'server' ? 'active' : ''} onClick={() => onVersion('server')} >Play Server Version</span>
    </nav>
  )
}
