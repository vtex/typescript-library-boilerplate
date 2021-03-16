/* eslint-disable no-shadow */
/* eslint-disable import/no-nodejs-modules */
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs/promises')
const path = require('path')
const readline = require('readline')

const resolveToFiles = (directory) => async (dirent) => {
  if (
    dirent.name === '.git' ||
    dirent.name === 'setup.js' ||
    dirent.name === 'node_modules'
  ) {
    return []
  }

  if (dirent.isFile()) return [path.resolve(directory, dirent.name)]
  if (dirent.isDirectory()) {
    return getFiles(path.resolve(directory, dirent.name))
  }

  return []
}

const getFiles = async (directory) => {
  const filesWithTypes = await fs.readdir(directory, {
    encoding: 'utf-8',
    withFileTypes: true,
  })

  const resolutions = filesWithTypes.map(resolveToFiles(directory))

  const files = await Promise.all(resolutions)

  return files.flat(1)
}

const removeInstructions = async () => {
  const startToken = '<!--START REMOVE-->'
  const endToken = '<!--END REMOVE-->'

  const readmePath = path.join(__dirname, 'README.md')
  const contents = await fs.readFile(readmePath, { encoding: 'utf-8' })

  const startRemove = contents.indexOf(startToken)
  const endRemove = contents.indexOf(endToken)

  if (startRemove !== -1 && endRemove !== -1) {
    const newContent =
      contents.slice(0, startRemove) +
      contents.slice(endRemove + endToken.length + 1)

    return fs.writeFile(readmePath, newContent)
  }
}

const gettingFiles = getFiles(path.resolve(__dirname))

const replaceInFile = (matcher, replacer) => async (path) => {
  const contents = await fs.readFile(path, { encoding: 'utf-8' })

  await fs.writeFile(path, contents.replace(matcher, replacer))
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const replaceVariable = async (variable, value) => {
  const files = await gettingFiles

  const matcher = new RegExp(`\\[${variable}\\]`, 'g')

  await Promise.all(files.map(replaceInFile(matcher, value)))
}

const fillTemplateVariable = (variable, question, defaultValue = '') =>
  new Promise((resolve) => {
    rl.question(question, async (receivedValue) => {
      const value = (receivedValue && receivedValue.trim()) || defaultValue

      replaceVariable(variable, value)

      rl.write(`Replaced ${variable} to "${value}".\n`)

      resolve()
    })
  })

replaceVariable('year', new Date().getFullYear())
  .then(() =>
    fillTemplateVariable(
      'libraryNameWithSpacesAndUpperCases',
      `
Library name (can have upper/lower case letters, spaces, numbers and special characters)
Ex. React.js, Vue.js, Fetch Interceptors, GraphQL Loader for Webpack etc.
> `
    )
  )
  .then(() =>
    fillTemplateVariable(
      'libraryName',
      `
Module name (only lower case letters, "." or "-") and optionally with scope.
Ex. react, vue, fetch-interceptors, @webpack/graphql-loader etc.
> `
    )
  )
  .then(() =>
    fillTemplateVariable(
      'libraryCamelCaseName',
      `
What is you library name in camel-case for UMD bundles?
Ex. React, Vue, fetchInterceptors, graphqlLoaderForWebpack etc.
> `
    )
  )
  .then(() =>
    fillTemplateVariable(
      'repositoryOwner',
      `
What is your nickname on GitHub?
> `,
      ''
    )
  )
  .then(() =>
    fillTemplateVariable(
      'repositoryName',
      `
What will be this repository name on GitHub?
> `
    )
  )
  .then(() =>
    fillTemplateVariable(
      'authorFullName',
      `
What is your full name? (used in MIT License)
> `,
      ''
    )
  )
  .then(() => removeInstructions())
  .then(() => {
    rl.close()
    fs.unlink(path.resolve(__filename))
  })
  .catch((error) => {
    console.error(
      error && error.message
        ? error && error.message
        : error || 'Unknown error.'
    )
    rl.close()
  })
