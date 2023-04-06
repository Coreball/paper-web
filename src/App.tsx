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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>
      setViewState({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
        zoom: 14,
      })
    )
  }, [])

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
