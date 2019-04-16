import React, { Component } from 'react'

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
      </div>
    )
  }
}

export default UserInfo
