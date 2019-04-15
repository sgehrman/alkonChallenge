import React, { Component } from 'react'
import SignButton from './components/SignButton'
import UserInfo from './components/UserInfo'
import UserLoginView from './components/UserLoginView'
import WalletButton from './components/WalletButton'
import axios from 'axios'
import Button from '@material-ui/core/Button'
import ORE from './js/ore'

let chainNetworkForExample = 'eos_kylin'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      userInfo: {},
    }

    this.ore = new ORE()

    this.server = 'https://kylin.eoscanada.com/'

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleSignButton = this.handleSignButton.bind(this)
    this.handleGetAccount = this.handleGetAccount.bind(this)
    this.handleContractTable = this.handleContractTable.bind(this)
    this.handleGetInfo = this.handleGetInfo.bind(this)
  }

  async componentWillMount() {
    this.loadUserFromLocalState()
    this.handleAuthCallback()
    this.handleSignCallback()
  }

  async loadUserFromLocalState() {
    const userInfo = (await this.ore.id.getUser()) || {}

    if ((userInfo || {}).accountName) {
      this.setState({ userInfo, isLoggedIn: true })
    }
  }

  async loadUserFromApi(account) {
    try {
      const userInfo = (await this.ore.id.getUserInfoFromApi(account)) || {}
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
    this.ore.id.logout() //clears local user state (stored in local storage or cookie)
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
      if (this.ore.id.canDiscover(provider)) {
        await this.ore.id.discover(provider, chainNetwork)
      } else {
        console.log(
          `Provider doesn't support discover, so we'll call login instead`
        )
        await this.ore.id.login({ provider, chainNetwork })
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
      let loginResponse = await this.ore.id.login({ provider, chainNetwork })
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
      let signResponse = await this.ore.id.sign(signOptions)
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
      const { account, errors, state } = await this.ore.id.handleAuthResponse(
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
      } = await this.ore.id.handleSignResponse(url)
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
      isLoggedIn,
      signedTransaction,
      signState,
      userInfo,
    } = this.state

    const isBusy = this.ore.isBusy()

    return (
      <div>
        <div>
          <UserLoginView
            isLoggedin={isLoggedIn}
            clickedLogin={this.handleLogin}
          />

          <UserInfo
            isLoggedin={isLoggedIn}
            userInfo={userInfo}
            clickedLogout={this.handleLogout}
          />

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

    const buttonGroupStyle = {
      display: 'flex',
      flexWrap: 'wrap',
    }

    return (
      <div>
        <div style={{ marginTop: 50, marginLeft: 20 }}>
          <h3 style={{ marginTop: 50 }}>Or discover a key in your wallet</h3>
          <div style={buttonGroupStyle}>
            {this.renderWalletDiscoverButtons(this.walletButtons)}
          </div>
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
          <SignButton
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
          >{`Sign Transaction with ${provider}`}</SignButton>
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
        <div key={index}>
          <WalletButton
            provider={provider}
            data-tag={index}
            text={`${provider}`}
            onClick={() => {
              this.handleWalletDiscoverButton(index)
            }}
          >{`${provider}`}</WalletButton>
        </div>
      )
    })

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
