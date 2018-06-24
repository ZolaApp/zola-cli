#!/usr/bin/env node
const { flatten, uniq } = require('lodash')
const walk = require('klaw')
const babel = require('babel-core')
const chalk = require('chalk')
const ora = require('ora')
const { retrieveProject } = require('./link')
const { createApolloClient } = require('./login')

const getAllFiles = async directory =>
  new Promise((resolve, reject) => {
    const items = []

    walk(process.cwd())
      .on('data', item => {
        const { path } = item

        if (path.endsWith('.js') && !path.includes('node_modules')) {
          items.push(path)
        }
      })
      .on('end', () => resolve(items))
  })

const parseFile = async file =>
  new Promise((resolve, reject) => {
    babel.transformFile(
      file,
      {
        presets: [require('babel-preset-env'), require('babel-preset-react')],
        plugins: [
          require('babel-plugin-transform-class-properties'),
          require('babel-plugin-syntax-dynamic-import'),
          require('babel-plugin-react-intl-krzkaczor').default
        ]
      },
      (err, result) => {
        if (err) {
          // Swallow error.
          return resolve([])
        }

        return resolve(
          result.metadata['react-intl'].messages.map(key => key.id)
        )
      }
    )
  })

const extractKeys = async files => {
  const keys = await Promise.all(files.map(parseFile))

  return uniq(flatten(keys))
}

const uploadKeys = async keys => {
  const fetch = await createApolloClient()
  const project = await retrieveProject()
  const response = await fetch({
    query: `mutation addTranslationKeysToProject($projectId: ID!, $keys: [String]) {
      addTranslationKeysToProject(projectId: $projectId, keys: $keys) {
        status
        errors {
          field
          message
        }
      }
    }`,
    variables: { projectId: project.id, keys }
  })

  const data = response.data.addTranslationKeysToProject

  if (data.status === 'FAILURE') {
    // Handle error
    data.errors.forEach(error => {
      console.log(chalk.bgRed.white(error.message))
    })

    process.exit(1)
  }
}

const handleExtract = async () => {
  const parsing = ora('Parsing project…')
  parsing.start()

  const files = await getAllFiles()
  parsing.text = 'Project parsed.'
  parsing.succeed()

  const extraction = ora('Extracting keys…')
  extraction.start()

  const keys = await extractKeys(files)
  extraction.text = `🔎  ${keys.length} keys found.`
  extraction.succeed()

  const uploading = ora('Uploading keys…')

  await uploadKeys(keys)
  uploading.text = `🚀  ${keys.length} keys uploaded.`
  uploading.succeed()
}

module.exports = {
  handleExtract
}
