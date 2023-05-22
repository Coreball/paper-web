import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slider,
  Typography,
} from '@mui/material'
import { Send } from '@mui/icons-material'
import { Feature, Point } from '@turf/turf'
import { Stamp } from './Stamp'
import { Launch, Plane } from './types'

export const EditSendDialog = ({
  currentPlane,
  creatingNewPlane,
  userCenter,
  handleCancelPlane,
  handleAddPlane,
}: EditSendDialogProps) => {
  // Edit plane dialog, open initially
  const [editDialogOpen, setEditDialogOpen] = useState(true)
  const [stampCoords, setStampCoords] = useState<[x: number, y: number] | null>(
    null
  )
  const [stampAngle, setStampAngle] = useState(0)
  const [stampVariant, setStampVariant] = useState(0)
  const handleStamp = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = new DOMPoint(e.clientX, e.clientY)
    const matrix = e.currentTarget.getScreenCTM()?.inverse()
    const position = point.matrixTransform(matrix)
    setStampCoords([position.x, position.y])
    setStampAngle(Math.random() * 180 - 90)
    setStampVariant(Math.floor(Math.random() * 2))
  }

  // Send plane dialog
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [sendHeading, setSendHeading] = useState(0)
  const canSendPlane = userCenter !== null && stampCoords !== null
  const sendPlane = () => {
    if (canSendPlane) {
      const launch: Launch = {
        origin: userCenter.geometry.coordinates,
        heading: sendHeading,
        timestamp: Date.now(),
        stamp: {
          x: stampCoords[0],
          y: stampCoords[1],
          angle: stampAngle,
          text: 'Test text',
          variant: stampVariant,
        },
      }
      if (currentPlane) {
        handleAddPlane({
          ...currentPlane,
          launches: [...currentPlane.launches, launch],
        })
      } else {
        handleAddPlane({
          launches: [launch],
        })
      }
    }
  }

  const active = currentPlane !== null || creatingNewPlane
  // useEffect to reset the dialog whenever changes to active
  useEffect(() => {
    if (active) {
      setEditDialogOpen(true)
      setSendDialogOpen(false)
    }
  }, [active])

  const handleNext = () => {
    setEditDialogOpen(false)
    setSendDialogOpen(true)
    setSendHeading(0)
  }

  return (
    <Dialog open={active} onClose={handleCancelPlane}>
      {editDialogOpen && (
        <>
          <DialogTitle>Edit Plane</DialogTitle>
          <DialogContent>
            <DialogContentText mb={2}>Tap to stamp the page</DialogContentText>
            <svg
              onClick={handleStamp}
              width={400}
              viewBox="0 0 850 1100"
              style={{ border: '2px solid lightgray' }}
            >
              {currentPlane?.launches.map((launch) => (
                <Stamp
                  x={launch.stamp.x}
                  y={launch.stamp.y}
                  angle={launch.stamp.angle}
                  text={launch.stamp.text}
                  variant={launch.stamp.variant}
                />
              ))}
              {stampCoords && (
                <Stamp
                  x={stampCoords[0]}
                  y={stampCoords[1]}
                  angle={stampAngle}
                  text="hi"
                  variant={stampVariant}
                />
              )}
            </svg>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelPlane}>Cancel</Button>
            <Button onClick={handleNext}>Next</Button>
          </DialogActions>
        </>
      )}
      {sendDialogOpen && (
        <>
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
            <Button onClick={handleCancelPlane}>Cancel</Button>
            <Button disabled={!canSendPlane} onClick={sendPlane}>
              Send
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

type EditSendDialogProps = {
  currentPlane: Plane | null
  creatingNewPlane: boolean
  userCenter: Feature<Point> | null
  handleCancelPlane: () => void
  handleAddPlane: (plane: Plane) => void
}
