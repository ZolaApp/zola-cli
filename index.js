#!/usr/bin/env node
const program = require('commander')

program
  .version('0.1.1')
  .command('login', 'Log in to your Zola account.')
  .command(
    'link <projectName>',
    'Link the current directory to your corresponding Zola project.'
  )
  .command(
    'extract',
    'Automatically extract all the keys from your code and upload them to your project.'
  )
  .command(
    'add <keyName> [defaultValue]',
    'Allows you to add a key manually to your project. You can add a value for the default locale if you wish, as second argument.'
  )
  .command(
    'remove <keyName>',
    'Allows you to remove a key manually from your project.'
  )
  .command('prune', 'Automatically prune your unused keys.')
  .option(
    '-p, --project',
    'Manually pass the project without relying on the link.'
  )
  .parse(process.argv)
