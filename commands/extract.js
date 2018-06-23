const { flatten, uniq } = require('lodash')
const walk = require('klaw')
const babel = require('babel-core')
const ora = require('ora')

const getAllFiles = async directory =>
  new Promise((resolve, reject) => {
    const items = []

    walk(process.env.INIT_CWD)
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
      { presets: ['env', 'react'], plugins: ['react-intl'] },
      (err, result) => {
        if (err) {
          // Swallow error.
          return resolve([])
        }

        return resolve(result.metadata['react-intl'].messages)
      }
    )
  })

const extractKeys = async files => {
  const keys = await Promise.all(files.map(parseFile))

  return uniq(flatten(keys))
}

const handleExtract = async () => {
  const parsing = ora('Parsing project…')
  parsing.start()

  const files = await getAllFiles()
  parsing.succeed()

  const extraction = ora('Extracting keys…')
  extraction.start()

  const keys = await extractKeys(files)
  extraction.text = `🔎  ${keys.length} keys found.`
  extraction.succeed()

  console.log(JSON.stringify(keys))
  // const uploading = ora('Uploading keys…')
  // uploading.start()

  // uploading.text = `🚀  ${keys.length} keys uploaded.`
  // uploading.succeed()
}

module.exports = {
  handleExtract
}
