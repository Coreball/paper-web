import { useEffect, useState } from 'react'
import { Box, Button } from '@mui/material'
import { SportsHandball, Telegram } from '@mui/icons-material'
import * as turf from '@turf/turf'
import { Layer, Map, Marker, Source } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { EditSendDialog } from './EditSendDialog'
import { Plane } from './types'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
const NEARBY_RADIUS_KM = 100
const PLANE_SPEED_KMS = 100

function App() {
  const [planes, setPlanes] = useState<Plane[]>([])
  const [currentPlane, setCurrentPlane] = useState<Plane | null>(null)
  const [creatingNewPlane, setCreatingNewPlane] = useState(false)

  // Map view state
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
  const userCenter =
    userCoordinates &&
    turf.point([userCoordinates.longitude, userCoordinates.latitude])
  const userRadius = userCenter && turf.circle(userCenter, NEARBY_RADIUS_KM)

  // Track the current date to reactively update positions
  const [currentDate, setCurrentDate] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => setCurrentDate(Date.now()), 20)
    return () => clearInterval(interval)
  }, [])

  const planePositions = planes.map((plane) =>
    turf.destination(
      plane.origin,
      ((currentDate - plane.timestamp) / 1000) * PLANE_SPEED_KMS,
      plane.heading
    )
  )

  const nearbyPlanes = userCenter
    ? planes.filter(
        (_, i) =>
          turf.distance(userCenter, planePositions[i]) <= NEARBY_RADIUS_KM
      )
    : []

  const handleCreateNewPlane = () => {
    setCurrentPlane(null)
    setCreatingNewPlane(true)
  }

  const handleCancelPlane = () => {
    if (currentPlane) {
      setPlanes([...planes, currentPlane]) // Add plane back unchanged
    }
    setCurrentPlane(null)
    setCreatingNewPlane(false)
  }

  const handleAddPlane = (plane: Plane) => {
    setPlanes([...planes, plane])
    setCurrentPlane(null)
    setCreatingNewPlane(false)
  }

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
        {userRadius && (
          <Source id="user-radius" type="geojson" data={userRadius}>
            <Layer
              id="user-radius"
              type="line"
              paint={{
                'line-color': '#ffffff',
                'line-width': 2,
                'line-dasharray': [2, 1],
              }}
            />
          </Source>
        )}
        {userCoordinates && (
          <Marker
            longitude={userCoordinates.longitude}
            latitude={userCoordinates.latitude}
          >
            <Box height={16} width={16}>
              <svg width={16} height={16}>
                <circle cx={8} cy={8} r={8} fill="#ffffff" />
                <circle cx={8} cy={8} r={6} fill="#0080ff" />
              </svg>
            </Box>
          </Marker>
        )}
        {planePositions.map((position) => (
          <Marker
            longitude={position.geometry.coordinates[0]}
            latitude={position.geometry.coordinates[1]}
          >
            <svg width={10} height={10}>
              <circle cx="5" cy="5" r="5" fill="red" />
            </svg>
          </Marker>
        ))}
      </Map>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          position: 'absolute',
          left: '50%',
          transform: 'translate(-50%, 0)',
          bottom: '24px',
        }}
      >
        <Button
          variant="contained"
          disableElevation
          endIcon={<SportsHandball />}
          disabled={
            currentPlane !== null || creatingNewPlane || nearbyPlanes.length < 1
          }
        >
          Catch Plane ({nearbyPlanes.length})
        </Button>
        <Button
          variant="contained"
          disableElevation
          endIcon={<Telegram />}
          disabled={currentPlane !== null || creatingNewPlane}
          onClick={handleCreateNewPlane}
        >
          Send Plane
        </Button>
      </Box>
      <EditSendDialog
        currentPlane={currentPlane}
        creatingNewPlane={creatingNewPlane}
        userCenter={userCenter}
        handleCancelPlane={handleCancelPlane}
        handleAddPlane={handleAddPlane}
      />
    </Box>
  )
}

export default App
