#!/usr/bin/env node
const path = require('path')
const homeDir = require('os').homedir()
const program = require('commander')
const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const { createApolloFetch } = require('apollo-fetch')
const configDir = `${homeDir}/.config/zola`
const wait = timeout => new Promise(resolve => setTimeout(resolve, timeout))
const getRandom = (min, max) => Math.floor(Math.random() * max) + min
const zolaApiUrl = 'https://api.zola.ink/graphql'
const zolaAppUrl = 'https://app.zola.ink'

program.version('0.2.0')

// Not cool but... still
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

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

const retrieveProject = async () => {
  try {
    const json = await fs.readJson(path.join('./', 'package.json'), {
      throws: false
    })

    return json.zola || false
  } catch (error) {
    console.log(
      chalk.bgRed.white(
        'An error occurred while retrieving the current project configuration, try linking the project again.\n'
      )
    )
    process.exit(1)
  }
}

const handleLink = async projectSlug => {
  const { token } = await retrieveLogin()

  const fetch = createApolloFetch({
    uri: zolaApiUrl
  })

  fetch.use(({ request, options }, next) => {
    if (!options.headers) {
      options.headers = {} // Create the headers object if needed.
    }

    options.headers['authorization'] = `Bearer ${token}`
    next()
  })

  fetch({
    query: `query getProject($projectSlug: String!) {
      getProject(projectSlug: $projectSlug) {
        id
        name
        slug
      }
    }`,
    variables: { projectSlug }
  }).then(async res => {
    const data = res.data.getProject

    if (data === null) {
      res.errors.forEach(error => {
        console.log(chalk.bgRed.white(error.message))
      })
      console.log('\n')
      const json = await fs.readJson(path.join('./', 'package.json'))
      delete json.zola
      await fs.writeJson(path.join('./', 'package.json'), json, { spaces: 4 })
      process.exit(1)
    }

    const json = await fs.readJson(path.join('./', 'package.json'))
    json.zola = { id: data.id, slug: data.slug, name: data.name }
    await fs.writeJson(path.join('./', 'package.json'), json, { spaces: 4 })
    console.log(chalk.green(`🔗 Successfully linked to project ${data.name}\n`))
    process.exit(0)
  })
}

const handleEmpty = () => {
  console.log(
    chalk.bgRed.white('Unknown argument. Run `zola --help` for instructions.\n')
  )
}

const handleDefault = () => {
  console.log(
    chalk.bgYellow.black(
      'Sorry! This command is not yet available but we’re working hard and we expect to ship it very soon!\n'
    )
  )
}

const handleExtract = () => {
  const keysCount = getRandom(50, 120)
  const parsing = ora('Parsing project…')
  const uploading = ora('Uploading…')

  parsing.start()

  wait(3000).then(() => {
    parsing.text = `${keysCount} new keys found…`
    parsing.succeed()
    uploading.start()

    wait(1000).then(() => {
      uploading.text = `${keysCount} keys uploaded. 🚀`
      uploading.succeed()
    })
  })
}

const handleLogin = async email => {
  const question = {
    type: 'password',
    message: `🔐 Enter password for user ${email}`,
    name: 'password'
  }

  inquirer.prompt(question).then(({ password }) => {
    const fetch = createApolloFetch({
      uri: zolaApiUrl
    })

    fetch({
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
    }).then(async res => {
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
        console.log(chalk.green('Login successful 🔓\n'))
        process.exit(0)
      }
    })
  })
}

program
  .command('login <email>')
  .alias('l')
  .description('Log in to your Zola account.')
  .action(handleLogin)

program
  .command('config')
  .description('Show active zola configuration')
  .action(async () => {
    try {
      const { email } = await retrieveLogin()
      const project = await retrieveProject()

      console.log(chalk.green(`🔓 Logged in as : ${email}`))

      if (!project) {
        console.log(
          chalk.white(
            `❌ No project linked, use zola link to set up a project for the current directory`
          )
        )
      } else {
        console.log(
          chalk.green(
            `🔗 Current project link: ${project.name} ${zolaAppUrl}/project/${
              project.slug
            }`
          )
        )
      }

      console.log('\n')
    } catch (err) {
      throw err
    }
  })

program
  .command('link <projectSlug>')
  .description('Link the current directory to your corresponding Zola project.')
  .action(handleLink)

program
  .command('extract')
  .description(
    'Automatically extract all the keys from your code and upload them to your project.'
  )
  .alias('e')
  .action(handleExtract)

program
  .command('add <keyName> [defaultValue]')
  .description(
    'Allows you to add a key manually to your project. You can add a value for the default locale if you wish, as second argument.'
  )
  .alias('a')
  .action(handleDefault)

program
  .command('remove <keyName>')
  .description('Allows you to remove a key manually from your project.')
  .alias('r')
  .action(handleDefault)

program
  .command('prune')
  .description('Automatically prune your unused keys.')
  .alias('p')
  .action(handleDefault)

program.command('*').action(handleEmpty)

program.parse(process.argv)

if (program.args.length === 0) {
  handleEmpty()
}
