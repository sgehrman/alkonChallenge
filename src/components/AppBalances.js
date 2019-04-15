import React, { Component } from 'react'

class AppBalances extends Component {
  render() {
    const { balances } = this.props
    console.log('rr', balances)

    if (balances) {
      return (
        <div>
          <h3>Application Balances</h3>
          {balances.rows.map((row, index) => {
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
          })}
        </div>
      )
    }
    return null
  }
}

export default AppBalances
