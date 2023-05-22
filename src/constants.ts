export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
export const BASE_URL = false // import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://6gsc637lf0.execute-api.us-east-1.amazonaws.com/Prod/'
export const AWS_EXPORTS = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_WJseFS9YZ',
  userPoolWebClientId: '3vd7d1liombm392qgoia1rh58u',
}
