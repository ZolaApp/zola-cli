#!/usr/bin/env node
const program = require('commander')
const chalk = require('chalk')
const { handleLogin } = require('./commands/login')
const { handleLink } = require('./commands/link')
const { handleAdd } = require('./commands/add')
const { handleConfig } = require('./commands/config')
const { handleExtract } = require('./commands/extract')

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

// We need this because fetch has an issue with our SSL certs atm
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

program.version('0.4.1')

program
  .command('login <email>')
  .alias('l')
  .description('Log in to your Zola account.')
  .action(handleLogin)

program
  .command('config')
  .description('Show active zola configuration')
  .action(handleConfig)

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
  .command('add <keyName>')
  .description('Allows you to add a key manually to your project.')
  .alias('a')
  .action(handleAdd)

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
