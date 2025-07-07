import * as core from '@actions/core'

export { getValues, Value, JsonfileContent }

interface Value {
  key: string
  value: string
  enabled: string
  type: string
}

interface ValueArg {
  secretKeyGithub?: string
  key: string
  enabled: string
  type: string
  value: string
}

interface JsonfileContent {
  values: ValueArg[]
}

function getValues(
  jsonfileContent: JsonfileContent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postmanEnvSecrets: any
): Value[] {
  const values = jsonfileContent.values
  return values.map((value: ValueArg) => {
    if (value.secretKeyGithub) {
      core.setOutput('secretKeyGithub', value.secretKeyGithub)
      return {
        key: value.key,
        value: postmanEnvSecrets[value.secretKeyGithub] ?? 'SECRET',
        enabled: value.enabled,
        type: value.type
      }
    } else {
      return {
        key: value.key,
        value: value.value,
        enabled: value.enabled,
        type: value.type
      }
    }
  })
}
