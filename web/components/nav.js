import Link from 'next/link'
import React from 'react'

export const Nav = () => (
  <nav>
    <Link href="/">
      <a>Play Client-Only Version</a>
    </Link>
    <Link href="/index2">
      <a>Play Server Version</a>
    </Link>

    <style jsx>{`
      nav {
        display: flex;
        padding: 16px 8px;
        justify-content: space-evenly;
        background-color: #c0c0c0;
      }
      
      a {
        text-decoration: none;
      }
    `}</style>
  </nav>
)
