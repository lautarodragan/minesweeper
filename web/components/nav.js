import Link from 'next/link'
import React from 'react'
import { useRouter } from 'next/router'

export const Nav = () => {
  const router = useRouter()

  return (
    <nav>
      <Link href="/">
        <a className={ router.pathname === '/index2' ? 'active' : ''}>Play Client-Only Version</a>
      </Link>
      <Link href="/index2">
        <a className={ router.pathname === '/' ? 'active' : ''}>Play Server Version</a>
      </Link>

      <style jsx>{`
        nav {
          display: flex;
          padding: 16px 8px;
          justify-content: space-evenly;
          background-color: #c0c0c0;
        }
        
        a {
          color: black;
          text-decoration: none;
          padding: 8px;
          border-top: 3px solid #808080;
          border-left: 3px solid #808080;
          border-bottom: 3px solid #fff;
          border-right: 3px solid #fff;
        }
        
        a.active {
          border-top: 3px solid #fff;
          border-left: 3px solid #fff;
          border-bottom: 3px solid #808080;
          border-right: 3px solid #808080;
        }
    `}</style>
    </nav>
  )
}
