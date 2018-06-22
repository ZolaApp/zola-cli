const chalk = require('chalk')
const { retrieveLogin } = require('./login')
const { retrieveProject } = require('./link')
const zolaAppUrl = 'https://app.zola.ink/'

const handleConfig = async () => {
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
}

module.exports = {
  handleConfig
}
