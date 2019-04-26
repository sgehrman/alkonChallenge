import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

export default function PasswordlessLogin(props) {
  const [code, setCode] = useState(0)
  const { ore } = props

  const handleInputChange = e => {
    const { value } = e.target
    setCode(value)
  }

  async function loginEmail() {
    const args = {
      'login-type': 'email',
      email: 'steve@aikon.com',
    }
    const result = await ore.id.loginPasswordless(args)

    console.log(result)
  }

  async function loginPhone() {
    const args = {
      'login-type': 'phone',
      phone: '+13107705341',
    }
    const result = await ore.id.loginPasswordless(args)

    console.log(result)
  }

  async function verifyEmail() {
    const args = {
      'login-type': 'email',
      email: 'steve@aikon.com',
      code,
    }
    const result = await ore.id.verifyPasswordless(args)

    console.log(result)
  }

  async function verifyPhone() {
    const args = {
      'login-type': 'phone',
      phone: '+13107705341',
      code,
    }
    const result = await ore.id.verifyPasswordless(args)

    console.log(result)
  }

  const style = {
    padding: '20px',
    background: 'rgba(0,0,0,.1)',
  }

  return (
    <div style={style}>
      <div>Passwordless</div>
      <Button onClick={loginEmail} color="primary">
        Email Login
      </Button>
      <Button onClick={loginPhone} color="primary">
        Phone Login
      </Button>
      <Button onClick={verifyEmail} color="primary">
        Email Verify
      </Button>
      <Button onClick={verifyPhone} color="primary">
        Phone Verify
      </Button>
      <TextField
        id="outlined-number"
        label="Number"
        onChange={handleInputChange}
        value={code}
        type="number"
        InputLabelProps={{
          shrink: true,
        }}
        margin="normal"
        variant="outlined"
      />
    </div>
  )
}
