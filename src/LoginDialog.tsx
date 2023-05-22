import { Dialog, DialogTitle, DialogContent } from '@mui/material'
import { Authenticator } from '@aws-amplify/ui-react'

export const LoginDialog = ({ active, handleClose }: LoginDialogProps) => {
  return (
    <Dialog open={active} onClose={handleClose}>
      <DialogTitle>Log In</DialogTitle>
      <DialogContent
        sx={{
          '--amplify-components-authenticator-router-border-style': 'none',
          '--amplify-components-authenticator-router-box-shadow': 'none',
        }}
      >
        <Authenticator />
      </DialogContent>
    </Dialog>
  )
}

type LoginDialogProps = {
  active: boolean
  handleClose: () => void
}
