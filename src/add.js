const chalk = require('chalk')
const { createApolloClient } = require('./login')
const { retrieveProject } = require('./link')

const handleAdd = async (keyName, defaultValue) => {
  const project = await retrieveProject()
  const fetch = await createApolloClient()

  if (!project) {
    console.log(
      chalk.white(
        `❌ No project linked, use zola link to set up a project for the current directory`
      )
    )
    process.exit(1)
  }

  const res = await fetch({
    query: `mutation addTranslationKeyToProject($projectId: ID!, $key: String!) {
      addTranslationKeyToProject(projectId: $projectId, key: $key) {
        status
        errors {
          message
        }
      }
    }`,
    variables: { projectId: project.id, key: keyName }
  })

  if (!res.data) {
    res.errors.forEach(error => {
      console.log(chalk.bgRed.white(error.message))
      console.log('\n')
      process.exit(1)
    })
  }

  const data = res.data.addTranslationKeyToProject

  if (data.status === 'FAILURE') {
    data.errors.forEach(error => {
      console.log(chalk.bgRed.white(error.message))
    })
    console.log('\n')
    process.exit(1)
  }

  console.log(
    chalk.green(
      `🔑 Successfully added key "${keyName}" to project ${project.name}\n`
    )
  )
  process.exit(0)
}

module.exports = {
  handleAdd
}
