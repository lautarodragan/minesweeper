export const ApiClient = ({ url, accessToken }) => {
  console.log('ApiClient', { url, accessToken })

  const authorizationHeaders = { Authorization: `Bearer ${accessToken}` }
  const contentTypeJsonHeaders = { 'Content-Type': 'application/json' }

  async function apiFetch(resource, options) {
    const response = await fetch(`${url}/${resource}`, {
      ...options,
      headers: {
        ...authorizationHeaders,
        ...contentTypeJsonHeaders,
      },
    })
    if (response.headers.get('Content-Type').startsWith('application/json'))
      return response.json()
    else
      return response.text()
  }

  const getGames = () =>  apiFetch('games')

  const getGame = (gameId) => apiFetch(`games/${gameId}`)

  async function createGame(game) {
    await apiFetch(`games`, {
      method: 'post',
      body: JSON.stringify(game),
    })
  }

  async function setCell(gameId, x, y, value) {
    await apiFetch(`games/${gameId}/cells/${x},${y}`, {
      method: 'put',
      body: JSON.stringify({
        value,
      }),
    })
  }

  async function createGameAndGet(game) {
    await createGame(game)
    return getGame(game.id)
  }

  async function setCellAndGet(gameId, x, y, value) {
    await setCell(gameId, x, y, value)
    return getGame(gameId)
  }

  return {
    createGame,
    createGameAndGet,
    getGame,
    setCell,
    setCellAndGet,
  }
}
