import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { destination, point } from '@turf/turf'
import { Map, Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const startDate = new Date()

function App() {
  const [viewState, setViewState] = useState({
    longitude: -100,
    latitude: 40,
    zoom: 3.5,
  })

  // Use user coordinates to display position, but don't move map
  const [userCoordinates, setUserCoordinates] =
    useState<GeolocationCoordinates | null>(null)
  useEffect(() => {
    const watchHandler = navigator.geolocation.watchPosition((position) =>
      setUserCoordinates(position.coords)
    )
    return () => navigator.geolocation.clearWatch(watchHandler)
  }, [])

  // Track the current date to reactively update positions
  const [currentDate, setCurrentDate] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setCurrentDate(new Date()), 20)
    return () => clearInterval(interval)
  }, [])

  const plane = point([-75.343, 39.984])
  const moved = destination(
    plane,
    ((currentDate.getTime() - startDate.getTime()) / 1000) * 1000, // 1000 km/s
    45
  )

  return (
    <Box sx={{ display: 'flex', height: window.innerHeight }}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        projection="globe"
        attributionControl={false}
      >
        {userCoordinates && (
          <Marker
            longitude={userCoordinates.longitude}
            latitude={userCoordinates.latitude}
          >
            <svg width={16} height={16}>
              <circle cx={8} cy={8} r={8} fill="#ffffff" />
              <circle cx={8} cy={8} r={6} fill="#0080ff" />
            </svg>
          </Marker>
        )}
        <Marker
          longitude={moved.geometry.coordinates[0]}
          latitude={moved.geometry.coordinates[1]}
        >
          <svg width={10} height={10}>
            <circle cx="5" cy="5" r="5" fill="red" />
          </svg>
        </Marker>
      </Map>
    </Box>
  )
}

export default App
