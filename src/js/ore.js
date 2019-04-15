import dotenv from 'dotenv'
import { OreId } from 'eos-auth'
import scatterProvider from 'eos-transit-scatter-provider'
import ledgerProvider from 'eos-transit-ledger-provider'
import lynxProvider from 'eos-transit-lynx-provider'
import meetoneProvider from 'eos-transit-meetone-provider'
import tokenpocketProvider from 'eos-transit-tokenpocket-provider'

dotenv.config()

const {
  REACT_APP_OREID_APP_ID: appId, // Provided when you register your app
  REACT_APP_OREID_API_KEY: apiKey, // Provided when you register your app
  REACT_APP_AUTH_CALLBACK: authCallbackUrl, // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_SIGN_CALLBACK: signCallbackUrl, // The url called by the server when transaction signing flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URL: oreIdUrl, // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR: backgroundColor, // Background color shown during login flow
} = process.env

export default class ORE {
  constructor() {
    const eosTransitWalletProviders = [
      scatterProvider(),
      // ledgerProvider(),
      ledgerProvider({ pathIndexList: [0, 1, 2, 35] }),
      lynxProvider(),
      meetoneProvider(),
      tokenpocketProvider(),
    ]

    this.busyFlag = false
    const setBusyCallback = isBusy => {
      this.busyFlag = isBusy
    }

    this.id = new OreId({
      appName: 'ORE ID Sample App',
      appId,
      apiKey,
      oreIdUrl,
      authCallbackUrl,
      signCallbackUrl,
      backgroundColor,
      eosTransitWalletProviders,
      setBusyCallback: setBusyCallback,
    })
  }

  isBusy() {
    return this.busyFlag
  }
}
