'use strict'

const expandGlobPaths = require('./expand-glob-paths')
const standard = require('standard')
const path = require('path')

const CONFIG = require('../config')

module.exports = async function () {
  const globPathsToLint = [
    path.join(CONFIG.repositoryRootPath, 'exports', '**', '*.js'),
    path.join(CONFIG.repositoryRootPath, 'packages', '**', '*.js'),
    path.join(CONFIG.repositoryRootPath, 'script', '**', '*.js'),
    path.join(CONFIG.repositoryRootPath, 'spec', '**', '*.js'),
    path.join(CONFIG.repositoryRootPath, 'src', '**', '*.js'),
    path.join(CONFIG.repositoryRootPath, 'static', '*.js')
  ]
  const globPathsToIgnore = [
    path.join(CONFIG.repositoryRootPath, 'spec', 'fixtures', '**', '*.js')
  ]

  const [includePaths, excludePaths] = await Promise.all([
    expandGlobPaths(globPathsToLint),
    expandGlobPaths(globPathsToIgnore)
  ])

  const paths = includePaths.filter(
    myPath => !excludePaths.includes(myPath)
  )

  return new Promise((resolve, reject) => {
    standard.lintFiles(paths, (error, lintOutput) => {
      if (error) {
        reject(error)
      } else {
        const errors = []
        for (let result of lintOutput.results) {
          for (let message of result.messages) {
            errors.push({
              path: result.filePath,
              lineNumber: message.line,
              message: message.message,
              rule: message.ruleId
            })
          }
        }
        resolve(errors)
      }
    })
  })
}
