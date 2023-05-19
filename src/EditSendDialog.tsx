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
import { Plane } from './types'

export const EditSendDialog = ({
  currentPlane,
  creatingNewPlane,
  userCenter,
  handleCancelPlane,
  handleAddPlane,
}: EditSendDialogProps) => {
  // Edit plane dialog, open initially
  const [editDialogOpen, setEditDialogOpen] = useState(true)

  // Send plane dialog
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [sendHeading, setSendHeading] = useState(0)
  const sendPlane = () => {
    if (canSendPlane) {
      handleAddPlane({
        origin: userCenter,
        heading: sendHeading,
        timestamp: Date.now(),
      })
    }
  }
  const canSendPlane = userCenter !== null

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
            <DialogContentText>TODO edit plane interface</DialogContentText>
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
