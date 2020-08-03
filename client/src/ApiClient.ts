interface ApiClientConfig {
  readonly url: string
  readonly accessToken: string
}

export interface ApiClient {
  readonly createGame: (game: any) => Promise<void>
  readonly createGameAndGet: (game: any) => Promise<any>
  readonly getGame: (id: string) => Promise<any>
  readonly getGames: () => Promise<readonly any[]>
  readonly setCell: (gameId: string, x: number, y: number, value: number) => Promise<void>
  readonly setCellAndGet: (gameId: string, x: number, y: number, value: number) => Promise<any>
}

export const ApiClient = ({ url, accessToken }: ApiClientConfig): ApiClient => {
  console.log('ApiClient', { url, accessToken })

  const authorizationHeaders = { Authorization: `Bearer ${accessToken}` }
  const contentTypeJsonHeaders = { 'Content-Type': 'application/json' }

  async function apiFetch(resource: string, options = {}) {
    const response = await fetch(`${url}/${resource}`, {
      ...options,
      headers: {
        ...authorizationHeaders,
        ...contentTypeJsonHeaders,
      },
    })
    if (response.headers.get('Content-Type')?.startsWith('application/json'))
      return response.json()
    else
      return response.text()
  }

  const getGames = () =>  apiFetch('games')

  const getGame = (gameId: string) => apiFetch(`games/${gameId}`)

  async function createGame(game: any) {
    await apiFetch(`games`, {
      method: 'post',
      body: JSON.stringify(game),
    })
  }

  async function setCell(gameId: string, x: number, y: number, value: number) {
    await apiFetch(`games/${gameId}/cells/${x},${y}`, {
      method: 'put',
      body: JSON.stringify({
        value,
      }),
    })
  }

  async function createGameAndGet(game: any): Promise<any> {
    await createGame(game)
    return getGame(game.id)
  }

  async function setCellAndGet(gameId: string, x: number, y: number, value: number) {
    await setCell(gameId, x, y, value)
    return getGame(gameId)
  }

  return {
    createGame,
    createGameAndGet,
    getGame,
    getGames,
    setCell,
    setCellAndGet,
  }
}
