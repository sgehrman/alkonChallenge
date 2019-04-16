import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import JSONView from './JSONView'

let showDialog = null

function UserInfoDialog(props) {
  const [open, setOpen] = useState(false)

  function handleClose() {
    setOpen(false)
  }

  showDialog = () => {
    setOpen(true)
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
      >
        <DialogTitle id="scroll-dialog-title">Account Information</DialogTitle>
        <DialogContent>
          <JSONView
            userInfo={props.userInfo}
            hideButton={true}
            mode="account"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export { UserInfoDialog, showDialog }
