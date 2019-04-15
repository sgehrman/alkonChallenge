const { JsonRpc } = require('eosjs')

export default class EOSRpc {
  constructor(server) {
    this.rpc = new JsonRpc(server)
  }

  async getRows(contract, scope, table) {
    const resp = await this.rpc.get_table_rows({
      json: true,
      code: contract,
      scope: scope,
      table: table,
    })

    console.log(resp)
  }

  async getInfo() {
    const resp = await this.rpc.get_info()

    console.log(resp)
  }

  async getAccount(accountName) {
    const resp = await this.rpc.get_account(accountName)

    console.log(resp)
  }
}
