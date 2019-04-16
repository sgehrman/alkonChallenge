import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks'
import ArrowDownward from '@material-ui/icons/ArrowDropDown'

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
    const buttonBox = {
      display: 'flex',
      justifyContent: 'center',
    }
    const innerButtonBox = {
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(0,0,50,.05)',
      borderRadius: '6px',
      border: 'solid 1px rgba(0,0,0,.25)',
      padding: '6px 20px',
      margin: '10px',
      alignItems: 'center',
    }

    const keyValueBox = {
      width: '300px',
    }
    const keyValueRow = {
      display: 'flex',
      marginBottom: '6px',
    }
    const keyColumn = {
      flex: '1 1 50%',
      marginRight: '20px',
      fontWeight: 'bold',
    }
    const valueColumn = {
      flex: '1 0 50%',
      textAlign: 'right',
    }

    if (!appName) {
      setAppName(balances.rows[0].origin)
    }
    return (
      <div style={buttonBox}>
        <div style={innerButtonBox}>
          <h3>{props.title}</h3>

          <div>
            <Button
              style={{ marginBottom: '10px' }}
              size="small"
              variant="outlined"
              {...bindTrigger(popupState)}
            >
              App: {appName}
              <ArrowDownward />
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
                <div key={index} style={keyValueBox}>
                  <div style={keyValueRow}>
                    <div style={keyColumn}>Balance</div>
                    <div style={valueColumn}>{row.balance}</div>
                  </div>

                  {row.contributors.map((contributor, i) => {
                    return (
                      <div key={i}>
                        <div style={keyValueRow}>
                          <div style={keyColumn}>Contributor</div>
                          <div style={valueColumn}>
                            {contributor.contributor}
                          </div>
                        </div>

                        <div style={keyValueRow}>
                          <div style={keyColumn}>Balance</div>
                          <div style={valueColumn}>{contributor.balance}</div>
                        </div>

                        <div style={keyValueRow}>
                          <div style={keyColumn}>RAM</div>
                          <div style={valueColumn}>{contributor.ram}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            } else {
              return null
            }
          })}
        </div>
      </div>
    )
  }
  return null
}
