const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants')

// This uses phases as outlined here: https://nextjs.org/docs/#custom-configuration
module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER // `next dev` or `npm run dev`
  const isProd = phase === PHASE_PRODUCTION_BUILD // `next build` or `npm run build`

  console.log(`isDev:${isDev}  isProd:${isProd}`)

  const env = {
    API_URL: isProd
      ? 'https://www.siliconvalley-codecamp.com/rest/speakers/ps'
      : 'http://localhost:8000',
  }

  return {
    env,
  }
}
