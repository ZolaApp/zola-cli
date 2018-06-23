const ora = require('ora')
const getRandom = (min, max) => Math.floor(Math.random() * max) + min
const wait = timeout => new Promise(resolve => setTimeout(resolve, timeout))

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
      uploading.text = `🚀  ${keysCount} keys uploaded.`
      uploading.succeed()
    })
  })
}

module.exports = {
  handleExtract
}
