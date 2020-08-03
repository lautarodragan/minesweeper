import Koa from 'koa'
import cors from '@koa/cors'
import KoaBodyparser from 'koa-bodyparser'
import KoaRouter from '@koa/router'
import jwt from 'koa-jwt'

interface Config {
  readonly port: number
  readonly router: KoaRouter
}

interface Server {
  readonly start: () => void
}

const secret = `
-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJcoe2ndsE1CQJMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi14enl1OWhvNi51cy5hdXRoMC5jb20wHhcNMjAwNzMxMTA1MTU0WhcN
MzQwNDA5MTA1MTU0WjAkMSIwIAYDVQQDExlkZXYteHp5dTlobzYudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvRpUMyiCNIDisU9k
FBb9zzBtKz91fogPBRxn0C1j2P/ZY9K+zopPBbWegXtvopssB1Pav+BSCo8b+LVP
uX15FilnaG+2l3Ai1hGJoHpBvJm0AGFGkMmWAbywGz3bidU7vRRnO/ENwm/pDtjT
aR3PRyQN4aVbwozHGDJrmmdIrBIlxw0BX/sHcbHuqL/2vDyDVvx82obCjhpLl0BF
U353bvmXPPvNe6tlqdwqAML/xTfzgIgbWoq9dlBiLs63+JTcZ9AxfGXUIFttGI3x
6S0Av/JBhMmp6mIA8+fg7NwuSysRRE//khL0bnQQ4OjZKwYET6YqrjTbl9neYdqS
NpI9UwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSC6bXMPzBp
62zvl+tsrkm6Hdcd/DAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ACbxt97C5euZ9Q3TojlM3aWAir0EwQYNNkv+qzb0m5IjDbFVbz6i6UwjfzNzJbgI
pvwTbLW/btv/OAgevX1yiylbtfUcMQhlFpZKW5eMfSUWhxIFjRv72wygptRvEy+p
e21v5QLAxPNQUCqMCJgalw9u+6gmfI3QIv6+V1xdf9kI+DfX7t/YEc+UH7FyQAlt
TyR4VgF0lJg9eD2Co8ne8t9Ie3EPFNI7odpiE6WP8SnzUjlz0KYrsjt044fVRHS7
VJh/OM7I+sovWKIMR8bLqUgy41LLLXC++c8JrFw5BTkHqeiwYg2QizJnMAcvcLJ+
Wz+gqf7BmFNGwkIuySKvQrI=
-----END CERTIFICATE-----
`

const logRequests = async (ctx: any, next: any) => {
  console.log(ctx.req.method, ctx.req.url, ctx.state.user.sub)
  await next()
}

export const Server = ({ port, router }: Config): Server => {
  const jwtCheck = jwt({
    secret,
    audience: 'https://taros-minesweeper.herokuapp.com',
    issuer: 'https://dev-xzyu9ho6.us.auth0.com/',
    algorithms: ['RS256'],
  });

  const koa = new Koa()
    .use(cors())
    .use(jwtCheck)
    .use(KoaBodyparser())
    .use(logRequests)
    .use(router.routes())
    .use(router.allowedMethods())

  const start = () => {
    koa.listen(port, '0.0.0.0')
  }

  return {
    start,
  }
}

