import React, { Component } from 'react'
import Button from '@material-ui/core/Button'

class UserInfo extends Component {
  render() {
    const { isLoggedin } = this.props

    if (isLoggedin) {
      return <div>{this.renderUserInfo()}</div>
    }

    return null
  }

  renderUserInfo() {
    const { accountName, email, name, picture, username } = this.props.userInfo

    return (
      <div style={{ padding: '10px' }}>
        <h3>User Info</h3>
        <img src={picture} style={{ width: 50, height: 50 }} alt={'user'} />
        <br />
        accountName: {accountName}
        <br />
        name: {name}
        <br />
        username: {username}
        <br />
        email: {email}
        <br />
        <Button
          onClick={this.props.clickedLogout}
          color="secondary"
          variant="contained"
        >
          Logout
        </Button>
      </div>
    )
  }
}

export default UserInfo
