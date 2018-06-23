const path = require('path')
const chalk = require('chalk')
const fs = require('fs-extra')
const { createApolloClient } = require('./login')

const retrieveProject = async () => {
  try {
    const json = await fs.readJson(path.join('./', 'package.json'), {
      throws: false
    })

    if (
      !json.zola ||
      !json.zola.id ||
      !json.zola.name ||
      !json.zola.slug ||
      !json.zola.defaultLocaleId
    ) {
      return false
    }

    return json.zola
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
  const fetch = await createApolloClient()

  const res = await fetch({
    query: `query getProject($projectSlug: String!) {
      getProject(projectSlug: $projectSlug) {
        id
        name
        slug
        locales {
          id
          code
        }
      }
    }`,
    variables: { projectSlug }
  })
  const data = res.data.getProject

  if (data === null) {
    res.errors.forEach(error => {
      console.log(chalk.bgRed.white(error.message))
    })
    console.log('\n')

    const json = await fs.readJson(path.join('./', 'package.json'))
    delete json.zola
    await fs.writeJson(path.join('./', 'package.json'), json, { spaces: 2 })
    process.exit(1)
  }

  const json = await fs.readJson(path.join('./', 'package.json'))
  json.zola = {
    id: data.id,
    slug: data.slug,
    name: data.name,
    defaultLocaleId: data.locales[0].id
  }
  await fs.writeJson(path.join('./', 'package.json'), json, { spaces: 2 })
  console.log(chalk.green(`🔗  Successfully linked to project ${data.name}\n`))
  process.exit(0)
}

module.exports = {
  retrieveProject,
  handleLink
}
