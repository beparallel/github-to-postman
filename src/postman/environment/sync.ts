/* eslint-disable sort-imports */
import * as core from '@actions/core'
import { addEnvironment } from './add'
import { deleteEnvironment } from './delete'
import { getAllEnvironments } from './get'
import { Environment } from './types'
import { getValues, JsonfileContent } from './value'

export { syncEnvironmentWithPostman }

async function syncEnvironmentWithPostman({
  githubPath,
  workspace,
  postmanApiKey,
  jsonfileContent,
  postmanEnvSecrets
}: {
  githubPath: string
  workspace: string
  postmanApiKey: string
  jsonfileContent: unknown
  postmanEnvSecrets: Object
}): Promise<string> {
  core.setOutput('githubPath', githubPath)
  const environmentName = getEnvironmentName(githubPath)
  core.setOutput('environmentName', environmentName)
  core.setOutput('postmanEnvSecrets', postmanEnvSecrets)

  const values = getValues(
    jsonfileContent as JsonfileContent,
    postmanEnvSecrets
  )
  const environments = await getAllEnvironments(workspace, postmanApiKey)

  const filterEnvironments = environments.filter(
    (e: Environment) => e.name === environmentName
  )
  await Promise.all(
    filterEnvironments.map(async (e: Environment) =>
      deleteEnvironment(e.id, postmanApiKey)
    )
  )
  await addEnvironment(workspace, environmentName, values, postmanApiKey)

  return 'ok'
}

function getEnvironmentName(githubPath: string): string {
  const a = githubPath.split('/')
  const fileName = a[a.length - 1]
  const a2 = fileName.split('.')
  return a2[0]
}
