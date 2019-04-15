import React, { Component } from 'react'
import Button from '@material-ui/core/Button'

let validProviders = [
  'oreid',
  'scatter',
  'facebook',
  'github',
  'google',
  'kakao',
  'line',
  'linkedin',
  'twitch',
  'twitter',
  'wechat',
  'ledger',
  'lynx',
  'meetone',
  'tokenpocket',
]

var defaultButtonStyle = {
  color: '#ffffff',
  width: 250,
  marginTop: '20px',
}

const defaultLogoStyle = {
  width: '24px',
  marginLeft: '10px',
  marginRight: '10px',
  verticalAlign: 'bottom',
}

class SocialLoginButton extends Component {
  constructor(props) {
    super(props)
    this.checkValidProvider(this.props.provider)
    let providerStyle =
      require(`../assets/button-styles/${this.props.provider}-style.json`) || {} //get the style for this provider
    this.state = {
      provider: this.props.provider,
      onClickCallback: this.props.onClick,
      buttonStyle: {
        ...defaultButtonStyle,
        ...providerStyle.buttonStyle,
      },
      logoStyle: defaultLogoStyle,
      text: this.props.text || providerStyle.text,
    }
  }

  checkValidProvider(provider) {
    if (!validProviders.includes(provider)) {
      throw Error(
        `${provider} is not one of the supported providers. Use one of the following: ${validProviders.join(
          ', '
        )}`
      )
    }
  }

  render() {
    let { provider, onClickCallback, buttonStyle, logoStyle, text } = this.state
    return (
      <div>
        <Button
          variant="contained"
          style={buttonStyle}
          onClick={() => {
            onClickCallback(provider)
          }}
        >
          <img
            style={logoStyle}
            src={require(`../assets/button-styles/${provider}-logo.png`)}
            alt={text}
          />
          {text}
        </Button>
      </div>
    )
  }
}

export default SocialLoginButton
