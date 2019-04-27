import { decorate, observable, action } from 'mobx';

export default class Model {
  userInfo = [];

  isLoggedIn = false;

  errorMessage;

  signedTransaction;

  signState;

  balances;

  clearErrors() {
    this.errorMessage = null;
    this.signedTransaction = null;
    this.signState = null;
  }
}

decorate(Model, {
  userInfo: observable,
  isLoggedIn: observable,
  errorMessage: observable,
  signedTransaction: observable,
  signState: observable,
  balances: observable,
  clearErrors: action,
});
