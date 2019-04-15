import React, { Component } from 'react'
import SocialLoginButton from './SocialLoginButton'

class UserLoginView extends Component {
  render() {
    const { isLoggedin } = this.props

    const buttonBox = {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    }
    const innerButtonBox = {
      display: 'flex',
      flexDirection: 'column',
    }

    if (!isLoggedin) {
      return (
        <div style={buttonBox}>
          <div style={innerButtonBox}>{this.renderLoginButtons()}</div>
        </div>
      )
    }

    return null
  }

  renderLoginButtons() {
    const { clickedLogin } = this.props

    return (
      <div>
        <SocialLoginButton
          provider="facebook"
          onClick={() => clickedLogin('facebook')}
          //  text='Log in with Facebook'
        />
        <SocialLoginButton
          provider="twitter"
          onClick={() => clickedLogin('twitter')}
          //  text='Log in with Twitter'
        />
        <SocialLoginButton
          provider="github"
          onClick={() => clickedLogin('github')}
          //  text='Log in with Github'
        />
        <SocialLoginButton
          provider="twitch"
          onClick={() => clickedLogin('twitch')}
          //  text='Log in with Twitch'
        />
        <SocialLoginButton
          provider="line"
          onClick={() => clickedLogin('line')}
          //  text='Log in with Line'
        />
        <SocialLoginButton
          provider="kakao"
          onClick={() => clickedLogin('kakao')}
          //  text='Log in with Kakao'
        />
        <SocialLoginButton
          provider="linkedin"
          onClick={() => clickedLogin('linkedin')}
          //  text='Log in with LinkedIn'
        />
        <SocialLoginButton
          provider="google"
          onClick={() => clickedLogin('google')}
          //  text='Log in with Google'
        />
        <SocialLoginButton
          provider="scatter"
          onClick={() => clickedLogin('scatter')}
          //  text='Log in with Scatter'
        />
      </div>
    )
  }
}

export default UserLoginView
