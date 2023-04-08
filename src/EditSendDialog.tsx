import { useState } from 'react'
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
    setEditDialogOpen(true)
    setSendDialogOpen(false)
    if (userCenter) {
      handleAddPlane({
        origin: userCenter,
        heading: sendHeading,
        timestamp: Date.now(),
      })
    }
  }
  const canSendPlane = userCenter !== null

  const active = currentPlane || creatingNewPlane
  const handleNext = () => {
    setEditDialogOpen(false)
    setSendDialogOpen(true)
    setSendHeading(0)
  }
  const handleCancel = () => {
    setEditDialogOpen(true)
    setSendDialogOpen(false)
    handleCancelPlane()
  }

  return (
    <>
      <Dialog open={active && editDialogOpen} onClose={handleCancel}>
        <DialogTitle>Edit Plane</DialogTitle>
        <DialogContent>
          <DialogContentText>TODO edit plane interface</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleNext}>Next</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={active && sendDialogOpen} onClose={handleCancel}>
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
          <Button onClick={handleCancel}>Cancel</Button>
          <Button disabled={!canSendPlane} onClick={sendPlane}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

type EditSendDialogProps = {
  currentPlane: Plane | null
  creatingNewPlane: boolean
  userCenter: Feature<Point> | null
  handleCancelPlane: () => void
  handleAddPlane: (plane: Plane) => void
}
