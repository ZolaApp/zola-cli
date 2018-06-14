# Zola CLI [![npm version](https://img.shields.io/npm/v/zola-cli.svg?style=flat)](https://www.npmjs.com/package/zola-cli)

Zola’s CLI is used to manage Zola projects from the command line.

# Commands

You can run `zola --help` to display the list of available commands.

`zola login`: Allows you to log in to your Zola account. This is the first thing you should do as we need to authenticate you.

`zola link <project name>`: Links the current directory to the corresponding Zola project. This is required since we need to know which project you’re trying to interact with. Note that you can pass the `--project <project name>` flag manually for every command instead.

`zola extract`: Automatically extracts all the keys from your code and uploads them.

`zola add <key name> [default value]`: Allows you to add a key manually. You can add a value for the default locale if you wish as second argument.

`zola remove <key name>`: Allows you to remove a key manually.

`zola prune`: Allows you to prune your unused keys. You will be prompted to confirm the keys deletions.

# License

BSD-3 License. See [LICENSE](LICENSE).
