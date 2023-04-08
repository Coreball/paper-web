import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slider,
  Typography,
} from '@mui/material'
import { Send, SportsHandball, Telegram } from '@mui/icons-material'
import * as turf from '@turf/turf'
import { Layer, Map, Marker, Source } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Plane } from './types'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

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
  const userCenter =
    userCoordinates &&
    turf.point([userCoordinates.longitude, userCoordinates.latitude])
  const userRadius = userCenter && turf.circle(userCenter, 100)

  // Send plane dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sendHeading, setSendHeading] = useState(0)
  const openSendPlane = () => {
    setIsDialogOpen(true)
    setSendHeading(0)
  }
  const closeSendPlane = () => {
    setIsDialogOpen(false)
  }
  const sendPlane = () => {
    if (userCenter) {
      setPlanes([
        ...planes,
        {
          origin: userCenter,
          heading: sendHeading,
          timestamp: Date.now(),
        },
      ])
    }
    closeSendPlane()
  }
  const canSendPlane = userCoordinates !== null

  // Track the current date to reactively update positions
  const [currentDate, setCurrentDate] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => setCurrentDate(Date.now()), 20)
    return () => clearInterval(interval)
  }, [])

  const [planes, setPlanes] = useState<Plane[]>([])

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
        {planes.map((plane) => {
          const position = turf.destination(
            plane.origin,
            currentDate - plane.timestamp,
            plane.heading
          )
          return (
            <Marker
              longitude={position.geometry.coordinates[0]}
              latitude={position.geometry.coordinates[1]}
            >
              <svg width={10} height={10}>
                <circle cx="5" cy="5" r="5" fill="red" />
              </svg>
            </Marker>
          )
        })}
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
        >
          Catch Plane
        </Button>
        <Button
          variant="contained"
          disableElevation
          endIcon={<Telegram />}
          disabled={isDialogOpen}
          onClick={openSendPlane}
        >
          Send Plane
        </Button>
      </Box>
      <Dialog open={isDialogOpen} onClose={closeSendPlane}>
        <DialogTitle>Send Plane</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {canSendPlane ? (
            <>
              <DialogContentText>
                Choose an initial plane heading
              </DialogContentText>
              <Send
                fontSize="large"
                sx={{ transform: `rotate(${sendHeading - 90}deg)` }}
              />
              <Typography mb={-2}>{sendHeading}</Typography>
              <Slider
                min={-180}
                max={180}
                value={sendHeading}
                onChange={(_, val) => setSendHeading(val as number)}
              />
            </>
          ) : (
            <DialogContentText>Need your location :(</DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSendPlane}>Cancel</Button>
          <Button disabled={!canSendPlane} onClick={sendPlane}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default App
