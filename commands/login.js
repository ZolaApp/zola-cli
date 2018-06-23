const path = require('path')
const homeDir = require('os').homedir()
const fs = require('fs-extra')
const chalk = require('chalk')
const configDir = `${homeDir}/.config/zola`
const { createApolloFetch } = require('apollo-fetch')
const inquirer = require('inquirer')

const zolaApiUrl = 'https://api.zola.ink/graphql'

const retrieveLogin = async () => {
  try {
    await fs.ensureFile(path.join(configDir, 'config.json'))
    const json = await fs.readJson(path.join(configDir, 'config.json'), {
      throws: false
    })

    if (!json || !json.email || !json.token) {
      console.log(
        chalk.bgRed.white(
          'You are not logged in, please use the login command before running this command.\n'
        )
      )

      // We write empty values here
      await fs.writeJson(path.join(configDir, 'config.json'), {
        email: '',
        token: ''
      })
      process.exit(1)
    } else {
      return { email: json.email, token: json.token }
    }
  } catch (error) {
    console.log(
      chalk.bgRed.white(
        'An error occurred while retrieving your credentials, try logging in again.\n'
      )
    )
    process.exit(1)
  }
}

const handleLogin = async email => {
  const question = {
    type: 'password',
    message: `🔐  Enter password for user with e-mail: \`${email}\``,
    name: 'password'
  }

  const { password } = await inquirer.prompt(question)
  const fetch = createApolloFetch({ uri: zolaApiUrl })
  const res = await fetch({
    query: `mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      status
      errors {
        message
      }
    }
  }`,
    variables: { email, password }
  })
  await fs.writeJson(path.join(configDir, 'config.json'), {
    email: '',
    token: ''
  })

  if (!res.data) {
    res.errors.forEach(error => {
      console.log(chalk.bgRed.white(error.message))
      console.log('\n')
      process.exit(1)
    })
  }

  const data = res.data.loginUser

  if (data.status === 'FAILURE') {
    // Handle error
    data.errors.forEach(error => {
      console.log(chalk.bgRed.white(error.message))
    })
    console.log('\n')
    process.exit(1)
  } else {
    const token = data.token
    await fs.writeJson(path.join(configDir, 'config.json'), {
      email,
      token
    })
    console.log(chalk.green('🔓  Login successful.\n'))
    process.exit(0)
  }
}

const createApolloClient = async () => {
  const { token } = await retrieveLogin()
  const fetch = createApolloFetch({ uri: zolaApiUrl })

  fetch.use(({ request, options }, next) => {
    if (!options.headers) {
      options.headers = {} // Create the headers object if needed.
    }

    options.headers['authorization'] = `Bearer ${token}`
    next()
  })

  return fetch
}

module.exports = {
  retrieveLogin,
  handleLogin,
  createApolloClient
}
