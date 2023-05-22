export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
export const BASE_URL = import.meta.env.PROD
  ? 'http://localhost:3000'
  : 'https://msrmd0wrya.execute-api.us-east-1.amazonaws.com/Prod/'
