import dotenv from 'dotenv'
import React, { Component } from 'react'
import LoginButton from './components/loginButton'
import SocialLoginButton from './components/SocialLoginButton'
import { OreId } from 'eos-auth'
import scatterProvider from 'eos-transit-scatter-provider'
import ledgerProvider from 'eos-transit-ledger-provider'
import lynxProvider from 'eos-transit-lynx-provider'
import meetoneProvider from 'eos-transit-meetone-provider'
import tokenpocketProvider from 'eos-transit-tokenpocket-provider'
import axios from 'axios'
import Button from '@material-ui/core/Button'

dotenv.config()

let chainNetworkForExample = 'eos_kylin'

const {
  REACT_APP_OREID_APP_ID: appId, // Provided when you register your app
  REACT_APP_OREID_API_KEY: apiKey, // Provided when you register your app
  REACT_APP_AUTH_CALLBACK: authCallbackUrl, // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_SIGN_CALLBACK: signCallbackUrl, // The url called by the server when transaction signing flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URL: oreIdUrl, // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR: backgroundColor, // Background color shown during login flow
} = process.env

let eosTransitWalletProviders = [
  scatterProvider(),
  // ledgerProvider(),
  ledgerProvider({ pathIndexList: [0, 1, 2, 35] }),
  lynxProvider(),
  meetoneProvider(),
  tokenpocketProvider(),
]

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      userInfo: {},
    }

    this.server = 'https://kylin.eoscanada.com/'

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleSignButton = this.handleSignButton.bind(this)
    this.handleGetAccount = this.handleGetAccount.bind(this)
    this.handleContractTable = this.handleContractTable.bind(this)
    this.handleGetInfo = this.handleGetInfo.bind(this)
  }

  //called by library to set local busy state
  setBusyCallback = isBusy => {
    this.setState({ isBusy })
  }

  //intialize oreId
  oreId = new OreId({
    appName: 'ORE ID Sample App',
    appId,
    apiKey,
    oreIdUrl,
    authCallbackUrl,
    signCallbackUrl,
    backgroundColor,
    eosTransitWalletProviders,
    setBusyCallback: this.setBusyCallback,
  })

  async componentWillMount() {
    this.loadUserFromLocalState()
    this.handleAuthCallback()
    this.handleSignCallback()
  }

  async loadUserFromLocalState() {
    const userInfo = (await this.oreId.getUser()) || {}

    if ((userInfo || {}).accountName) {
      this.setState({ userInfo, isLoggedIn: true })
    }
  }

  async loadUserFromApi(account) {
    try {
      const userInfo = (await this.oreId.getUserInfoFromApi(account)) || {}
      this.setState({ userInfo, isLoggedIn: true })
    } catch (error) {
      this.setState({ errorMessage: error.message })
    }
  }

  clearErrors() {
    this.setState({
      errorMessage: null,
      signedTransaction: null,
      signState: null,
    })
  }

  handleLogout() {
    this.clearErrors()
    this.setState({ userInfo: {}, isLoggedIn: false })
    this.oreId.logout() //clears local user state (stored in local storage or cookie)
  }

  async handleSignButton(permissionIndex) {
    this.clearErrors()
    let {
      chainAccount,
      chainNetwork,
      permission,
      externalWalletType: provider,
    } = this.permissionsToRender[permissionIndex] || {}
    let { accountName } = this.state.userInfo
    provider = provider || 'oreid' //default to ore id
    await this.handleSignSampleTransaction(
      provider,
      accountName,
      chainAccount,
      chainNetwork,
      permission
    )
  }

  async handleWalletDiscoverButton(permissionIndex) {
    let chainNetwork = chainNetworkForExample
    try {
      this.clearErrors()
      let { provider } = this.walletButtons[permissionIndex] || {}
      if (this.oreId.canDiscover(provider)) {
        await this.oreId.discover(provider, chainNetwork)
      } else {
        console.log(
          `Provider doesn't support discover, so we'll call login instead`
        )
        await this.oreId.login({ provider, chainNetwork })
      }
      this.loadUserFromApi(this.state.userInfo.accountName) //reload user from ore id api - to show new keys discovered
    } catch (error) {
      this.setState({ errorMessage: error.message })
    }
  }

  async handleLogin(provider) {
    let chainNetwork = chainNetworkForExample
    try {
      this.clearErrors()
      let loginResponse = await this.oreId.login({ provider, chainNetwork })
      //if the login responds with a loginUrl, then redirect the browser to it to start the user's OAuth login flow
      let { isLoggedIn, account, loginUrl } = loginResponse
      if (loginUrl) {
        //redirect browser to loginURL
        window.location = loginUrl
      }
      this.setState({
        userInfo: { accountName: account },
        isLoggedIn: isLoggedIn,
      })
    } catch (error) {
      this.setState({ errorMessage: error.message })
    }
  }

  async handleSignSampleTransaction(
    provider,
    account,
    chainAccount,
    chainNetwork,
    permission
  ) {
    try {
      this.clearErrors()
      const transaction = this.createSampleTransaction(chainAccount, permission)
      let signOptions = {
        provider: provider || '', //wallet type (e.g. 'scatter' or 'oreid')
        account: account || '',
        broadcast: false, //if broadcast=true, ore id will broadcast the transaction to the chain network for you
        chainAccount: chainAccount || '',
        chainNetwork: chainNetwork || '',
        state: 'abc', //anything you'd like to remember after the callback
        transaction,
        accountIsTransactionPermission: false,
      }
      let signResponse = await this.oreId.sign(signOptions)
      //if the sign responds with a signUrl, then redirect the browser to it to call the signing flow
      let { signUrl, signedTransaction } = signResponse || {}
      if (signUrl) {
        //redirect browser to signUrl
        window.location = signUrl
      }
      if (signedTransaction) {
        this.setState({ signedTransaction: JSON.stringify(signedTransaction) })
      }
    } catch (error) {
      this.setState({ errorMessage: error.message })
    }
  }

  createSampleTransaction(actor, permission = 'active') {
    const transaction = {
      account: 'eosio.token',
      name: 'transfer',
      authorization: [
        {
          actor,
          permission,
        },
      ],
      data: {
        from: actor,
        to: actor,
        quantity: '0.0001 EOS',
        memo: `random number: ${Math.random()}`,
      },
    }
    return transaction
  }

  /*
     Handle the authCallback coming back from ORE-ID with an "account" parameter indicating that a user has logged in
  */
  async handleAuthCallback() {
    const url = window.location.href
    if (/authcallback/i.test(url)) {
      const { account, errors, state } = await this.oreId.handleAuthResponse(
        url
      )
      if (!errors) {
        this.loadUserFromApi(account)
      }
    }
  }

  /*
     Handle the signCallback coming back from ORE-ID with a "signedTransaction" parameter providing the transaction object with signatures attached
  */
  async handleSignCallback() {
    const url = window.location.href
    if (/signcallback/i.test(url)) {
      const {
        signedTransaction,
        state,
        errors,
      } = await this.oreId.handleSignResponse(url)
      if (!errors && signedTransaction) {
        this.setState({
          signedTransaction: JSON.stringify(signedTransaction),
          signState: state,
        })
      } else {
        this.setState({ errorMessage: errors.join(', ') })
      }
    }
  }

  render() {
    let {
      errorMessage,
      isBusy,
      isLoggedIn,
      signedTransaction,
      signState,
    } = this.state
    return (
      <div>
        <div>
          {!isLoggedIn && this.renderLoginButtons()}
          {isLoggedIn && this.renderUserInfo()}
          {isLoggedIn && this.renderSigningOptions()}
          {isLoggedIn && this.renderAccountInfoButton()}
        </div>
        <h3 style={{ color: 'green', margin: '50px' }}>
          {isBusy && 'working...'}
        </h3>
        <div style={{ color: 'red', margin: '50px' }}>
          {errorMessage && errorMessage}
        </div>
        <div style={{ color: 'blue', marginLeft: '50px', marginTop: '50px' }}>
          {signedTransaction &&
            `Returned signed transaction: ${signedTransaction}`}
        </div>
        <div style={{ color: 'blue', marginLeft: '50px', marginTop: '10px' }}>
          {signState && `Returned state param: ${signState}`}
        </div>
        {isLoggedIn && this.renderDiscoverOptions()}
      </div>
    )
  }

  renderUserInfo() {
    const { accountName, email, name, picture, username } = this.state.userInfo
    return (
      <div style={{ marginTop: 50, marginLeft: 40 }}>
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
          onClick={this.handleLogout}
          color="secondary"
          variant="contained"
        >
          Logout
        </Button>
      </div>
    )
  }

  renderSigningOptions() {
    let { permissions } = this.state.userInfo
    this.permissionsToRender = (permissions || []).slice(0)

    return (
      <div>
        <div style={{ marginTop: 50, marginLeft: 20 }}>
          <h3>Sign transaction with one of your keys</h3>
          <ul>{this.renderSignButtons(this.permissionsToRender)}</ul>
        </div>
      </div>
    )
  }

  renderDiscoverOptions() {
    let chainNetwork = chainNetworkForExample
    this.walletButtons = [
      { provider: 'scatter', chainNetwork },
      { provider: 'ledger', chainNetwork },
      { provider: 'lynx', chainNetwork },
      { provider: 'meetone', chainNetwork },
      { provider: 'tokenpocket', chainNetwork },
    ]
    return (
      <div>
        <div style={{ marginTop: 50, marginLeft: 20 }}>
          <h3 style={{ marginTop: 50 }}>Or discover a key in your wallet</h3>
          <ul>{this.renderWalletDiscoverButtons(this.walletButtons)}</ul>
        </div>
      </div>
    )
  }

  //render one sign transaction button for each chain
  renderSignButtons = permissions =>
    permissions.map((permission, index) => {
      let provider = permission.externalWalletType || 'oreid'
      return (
        <div style={{ alignContent: 'center' }} key={index}>
          <LoginButton
            provider={provider}
            data-tag={index}
            buttonStyle={{
              width: 225,
              marginLeft: -20,
              marginTop: 20,
              marginBottom: 10,
            }}
            text={`Sign with ${provider}`}
            onClick={() => {
              this.handleSignButton(index)
            }}
          >{`Sign Transaction with ${provider}`}</LoginButton>
          {`Chain:${permission.chainNetwork} ---- Account:${
            permission.chainAccount
          } ---- Permission:${permission.permission}`}
        </div>
      )
    })

  //render one sign transaction button for each chain
  renderWalletDiscoverButtons = walletButtons =>
    walletButtons.map((wallet, index) => {
      let provider = wallet.provider
      return (
        <div style={{ alignContent: 'center' }} key={index}>
          <LoginButton
            provider={provider}
            data-tag={index}
            buttonStyle={{
              width: 80,
              marginLeft: -20,
              marginTop: 20,
              marginBottom: 10,
            }}
            text={`${provider}`}
            onClick={() => {
              this.handleWalletDiscoverButton(index)
            }}
          >{`${provider}`}</LoginButton>
        </div>
      )
    })

  renderLoginButtons() {
    return (
      <div>
        <SocialLoginButton
          provider="facebook"
          onClick={() => this.handleLogin('facebook')}
          //  text='Log in with Facebook'
        />
        <SocialLoginButton
          provider="twitter"
          onClick={() => this.handleLogin('twitter')}
          //  text='Log in with Twitter'
        />
        <SocialLoginButton
          provider="github"
          onClick={() => this.handleLogin('github')}
          //  text='Log in with Github'
        />
        <SocialLoginButton
          provider="twitch"
          onClick={() => this.handleLogin('twitch')}
          //  text='Log in with Twitch'
        />
        <SocialLoginButton
          provider="line"
          onClick={() => this.handleLogin('line')}
          //  text='Log in with Line'
        />
        <SocialLoginButton
          provider="kakao"
          onClick={() => this.handleLogin('kakao')}
          //  text='Log in with Kakao'
        />
        <SocialLoginButton
          provider="linkedin"
          onClick={() => this.handleLogin('linkedin')}
          //  text='Log in with LinkedIn'
        />
        <SocialLoginButton
          provider="google"
          onClick={() => this.handleLogin('google')}
          //  text='Log in with Google'
        />
        <SocialLoginButton
          provider="scatter"
          onClick={() => this.handleLogin('scatter')}
          //  text='Log in with Scatter'
        />
      </div>
    )
  }

  renderAccountInfoButton() {
    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleGetInfo}
        >
          Get info
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleGetAccount}
        >
          Account Info
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleContractTable}
        >
          Contract Table
        </Button>
      </div>
    )
  }

  handleGetAccount() {
    const { accountName } = this.state.userInfo
    const data = {
      Name: accountName,
    }
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    }

    axios
      .post(
        'https://ore-staging.openrights.exchange/v1/chain/get_account',
        data,
        { headers: headers }
      )
      .then(function(response) {
        console.log(response)
      })
      .catch(function(error) {
        console.log(error)
      })
  }

  handleGetInfo() {
    axios
      .get(this.server + 'v1/chain/get_info')
      .then(function(response) {
        console.log(response)
      })
      .catch(function(error) {
        console.log(error)
      })
  }

  handleContractTable() {
    const data = {
      code: 'createbridge',
      table: 'balances',
      scope: 'createbridge',
      json: true,
    }
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    }

    axios
      .post(this.server + 'v1/chain/get_table_rows', data, {
        headers: headers,
      })
      .then(function(response) {
        console.log(response)
      })
      .catch(function(error) {
        console.log(error)
      })
  }
}

export default App
