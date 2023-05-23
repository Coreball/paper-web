import { useEffect, useState } from 'react'
import { Box, Button } from '@mui/material'
import { Send, SportsHandball, Telegram } from '@mui/icons-material'
import * as turf from '@turf/turf'
import { Layer, Map, Marker, Source } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Amplify, Auth, Hub } from 'aws-amplify'
import { CognitoUser } from 'amazon-cognito-identity-js'
import { EditSendDialog } from './EditSendDialog'
import { AWS_EXPORTS, BASE_URL, MAPBOX_TOKEN } from './constants'
import { Plane } from './types'
import { LoginDialog } from './LoginDialog'

const NEARBY_RADIUS_KM = 100
const PLANE_SPEED_KMS = 1

Amplify.configure({ Auth: AWS_EXPORTS })

function App() {
  const [user, setUser] = useState<CognitoUser | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  // Set up listener to update user state for authentication state changes
  useEffect(() => {
    const listener = Hub.listen('auth', ({ payload: { event, data } }) => {
      console.log(event, 'auth event')
      switch (event) {
        case 'signIn':
          getUser().then((userData) => setUser(userData))
          break
        case 'signOut':
          setUser(null)
          break
      }
    })
    getUser().then((userData) => setUser(userData))
    return listener
  }, [])
  const getUser = () =>
    Auth.currentAuthenticatedUser()
      .then((userData) => {
        console.log(userData)
        return userData as CognitoUser
      })
      .catch(() => {
        console.log('Not signed in')
        return null
      })

  const [planes, setPlanes] = useState<Plane[]>([])
  const [caughtPlane, setCaughtPlane] = useState<Plane | null>(null)
  const [creatingNewPlane, setCreatingNewPlane] = useState(false)
  const [highlightPlane, setHighlightPlane] = useState<Plane | null>(null)

  // Load planes from API, polling periodically
  useEffect(() => {
    const interval = setInterval(
      () =>
        fetch(BASE_URL)
          .then((res) => res.json())
          .then((data) =>
            // Wait to update current plane until it's released
            setPlanes(
              data.filter((plane: Plane) => plane.id !== caughtPlane?.id)
            )
          )
          .catch((err) => console.error(err)),
      5000
    )
    return () => clearInterval(interval)
  }, [caughtPlane])

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

  const planePositions = planes.map((plane) => {
    const mostRecentLaunch = plane.launches[plane.launches.length - 1]
    const position = turf.destination(
      mostRecentLaunch.origin,
      ((currentDate - mostRecentLaunch.timestamp) / 1000) * PLANE_SPEED_KMS,
      mostRecentLaunch.heading
    )
    const nextPosition = turf.destination(
      mostRecentLaunch.origin,
      ((currentDate + 1 - mostRecentLaunch.timestamp) / 1000) * PLANE_SPEED_KMS,
      mostRecentLaunch.heading
    )
    const heading = turf.bearing(position, nextPosition)
    return { id: plane.id, position, heading }
  })

  // Highlight path for user-owned highlighted plane
  const highlightPath =
    highlightPlane &&
    turf.lineString([
      ...highlightPlane.launches.map((launch) => launch.origin),
      ...planePositions
        .filter((plane) => plane.id === highlightPlane.id)
        .map((plane) => plane.position.geometry.coordinates),
    ])

  const nearbyPlanes = userCenter
    ? planes.filter(
        (_, i) =>
          turf.distance(userCenter, planePositions[i].position) <=
          NEARBY_RADIUS_KM
      )
    : []

  const handleCatchPlane = () => {
    const randomNearbyPlane =
      nearbyPlanes[Math.floor(Math.random() * nearbyPlanes.length)]
    console.log('Catch Plane', randomNearbyPlane)
    setPlanes(planes.filter((plane) => plane !== randomNearbyPlane))
    setCaughtPlane(randomNearbyPlane)
    setCreatingNewPlane(false)
  }

  const handleCreateNewPlane = () => {
    setCaughtPlane(null)
    setCreatingNewPlane(true)
  }

  const handleCancelPlane = () => {
    if (caughtPlane) {
      setPlanes([...planes, caughtPlane]) // Add plane back unchanged
    }
    setCaughtPlane(null)
    setCreatingNewPlane(false)
  }

  const handleAddPlane = (plane: Plane) => {
    console.log('Add Plane', plane)
    setPlanes([...planes, plane])
    setCaughtPlane(null)
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
        onClick={() => setHighlightPlane(null)}
      >
        {highlightPath && (
          <Source id="highlight-path" type="geojson" data={highlightPath}>
            <Layer
              id="highlight-path"
              type="line"
              paint={{ 'line-color': 'orange', 'line-width': 2 }}
            />
          </Source>
        )}
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
        {planes.map((plane, i) => (
          <Marker
            key={plane.id}
            longitude={planePositions[i].position.geometry.coordinates[0]}
            latitude={planePositions[i].position.geometry.coordinates[1]}
            rotationAlignment="map"
            style={{ filter: 'drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))' }}
          >
            <Send
              fontSize="small"
              // Using the sx prop here significantly hurts performance
              style={{
                color:
                  plane.owner && plane.owner === user?.getUsername()
                    ? 'gold'
                    : 'white',
                transform: `rotate(${planePositions[i].heading - 90}deg)`,
              }}
              onClick={
                plane.owner && plane.owner === user?.getUsername()
                  ? (e) => {
                      setHighlightPlane(plane)
                      e.stopPropagation()
                    }
                  : undefined
              }
            />
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
          top: '24px',
        }}
      >
        {user ? (
          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              Auth.signOut()
              setHighlightPlane(null)
            }}
          >
            Log Out
          </Button>
        ) : (
          <Button
            variant="contained"
            disableElevation
            onClick={() => setLoginOpen(true)}
          >
            Log In
          </Button>
        )}
      </Box>
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
            caughtPlane !== null || creatingNewPlane || nearbyPlanes.length < 1
          }
          onClick={handleCatchPlane}
        >
          Catch Plane ({nearbyPlanes.length})
        </Button>
        <Button
          variant="contained"
          disableElevation
          endIcon={<Telegram />}
          disabled={caughtPlane !== null || creatingNewPlane}
          onClick={handleCreateNewPlane}
        >
          Send Plane
        </Button>
      </Box>
      <EditSendDialog
        user={user}
        caughtPlane={caughtPlane}
        creatingNewPlane={creatingNewPlane}
        userCenter={userCenter}
        handleCancelPlane={handleCancelPlane}
        handleAddPlane={handleAddPlane}
      />
      <LoginDialog
        active={loginOpen}
        handleClose={() => {
          setLoginOpen(false)
        }}
      />
    </Box>
  )
}

export default App
