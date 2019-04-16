import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks'

export default function AppBalances(props) {
  const [appName, setAppName] = useState(null)

  const { balances } = props

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoMenu',
  })

  function menuSelected(popupState, appName) {
    setAppName(appName)
    popupState.close()
  }

  if (balances) {
    if (!appName) {
      setAppName(balances.rows[0].origin)
    }
    return (
      <div>
        <h3>Application Balances</h3>

        <div>
          <Button variant="contained" {...bindTrigger(popupState)}>
            App: {appName}
          </Button>
          <Menu {...bindMenu(popupState)}>
            {balances.rows.map((row, index) => {
              return (
                <MenuItem
                  key={index}
                  onClick={() => menuSelected(popupState, row.origin)}
                >
                  {row.origin}
                </MenuItem>
              )
            })}
          </Menu>
        </div>

        {balances.rows.map((row, index) => {
          if (row.origin === appName) {
            return (
              <div key={index}>
                <div>App: {row.origin}</div>
                <div>Balance: {row.balance}</div>

                {row.contributors.map((contributor, i) => {
                  return (
                    <div key={i}>
                      <div>Contributor: {contributor.contributor}</div>
                      <div>Balance: {contributor.balance}</div>
                      <div>RAM: {contributor.ram}</div>
                    </div>
                  )
                })}
              </div>
            )
          }
        })}
      </div>
    )
  }
  return null
}
