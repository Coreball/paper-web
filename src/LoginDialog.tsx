import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from '@mui/material'
import { Auth } from 'aws-amplify'

export const LoginDialog = ({ active, handleClose }: LoginDialogProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginInProgress, setLoginInProgress] = useState(false)
  const [loginError, setLoginError] = useState(false)

  const signIn = () => {
    setLoginInProgress(true)
    setLoginError(false)
    Auth.signIn(username, password)
      .then(hide)
      .catch((e) => {
        console.info(e)
        setLoginInProgress(false)
        setLoginError(true)
      })
  }

  const hide = () => {
    setLoginInProgress(false)
    setLoginError(false)
    handleClose()
  }

  return (
    <Dialog open={active} onClose={hide}>
      <DialogTitle>Log In</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          paddingTop: '4px !important',
        }}
      >
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={loginError}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={loginError}
          helperText={loginError && 'Incorrect username or password'}
        />
        <Button
          variant="contained"
          disableElevation
          disabled={loginInProgress}
          onClick={signIn}
        >
          Log In
        </Button>
      </DialogContent>
    </Dialog>
  )
}

type LoginDialogProps = {
  active: boolean
  handleClose: () => void
}
