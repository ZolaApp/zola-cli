#!/usr/bin/env node
const COMMANDS = ['login', 'link', 'extract', 'add', 'remove', 'prune']
const program = require('commander')
const chalk = require('chalk')

program
  .version('0.1.1')
  .option(
    '-p, --project',
    'Manually pass the project without relying on the link.'
  )
  .command('login', 'Log in to your Zola account.')
  .command(
    'link <projectName>',
    'Link the current directory to your corresponding Zola project.'
  )
  .command(
    'extract',
    'Automatically extract all the keys from your code and upload them to your project.'
  )
  .alias('e')
  .command(
    'add <keyName> [defaultValue]',
    'Allows you to add a key manually to your project. You can add a value for the default locale if you wish, as second argument.'
  )
  .alias('a')
  .command(
    'remove <keyName>',
    'Allows you to remove a key manually from your project.'
  )
  .alias('r')
  .command('prune', 'Automatically prune your unused keys.')
  .alias('p')
  .parse(process.argv)

const executedCommand = program.args[0]

switch (executedCommand) {
  case 'extract':
    console.log(chalk.green('extracting'))
    process.exit(0)

  default:
    if (!COMMANDS.includes(executedCommand)) {
      console.log(chalk.bgRed.white('This command doesn’t exist, exiting…\n'))
      process.exit(1)
    }

    console.log(
      chalk.bgYellow.black(
        'Sorry! This command is not yet available but we’re working hard and we expect to ship it very soon!\n'
      )
    )
    process.exit(0)
}
