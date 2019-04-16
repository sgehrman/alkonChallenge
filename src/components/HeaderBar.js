import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
    lineHeight: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 10,
  },
  imageWrapper: {
    margin: '2px 10px 2px 0',
    borderRadius: '500px',
    height: '30px',
    width: '30px',
    border: 'solid 1px rgba(0,0,0,.5)',
    overflow: 'hidden',
  },
}

function HeaderBar(props) {
  const { classes, logout, isLoggedin, userInfo } = props
  let image = null
  let name = 'Dashboard'

  if (userInfo) {
    if (userInfo.picture) {
      image = userInfo.picture
    }
    if (userInfo.name) {
      name = userInfo.name
    } else if (userInfo.username) {
      name = userInfo.username
    }
    if (userInfo.accountName) {
      name += ': ' + userInfo.accountName
    }
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
          >
            <MenuIcon />
          </IconButton>

          {image && (
            <div className={classes.imageWrapper}>
              <img src={image} alt="" style={{ height: '100%' }} />
            </div>
          )}

          <Typography
            variant="subtitle2"
            color="inherit"
            className={classes.grow}
          >
            {name}
          </Typography>
          {isLoggedin && (
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </div>
  )
}

HeaderBar.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(HeaderBar)
