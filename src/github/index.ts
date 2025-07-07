import { Octokit } from 'octokit'

export { getFileFromGithub }

interface IGithubFile {
  content: string
}

async function getFileFromGithub({
  githubToken,
  owner,
  repo,
  path,
  ref
}: {
  githubToken: string
  owner: string
  repo: string
  path: string
  ref: string
}): Promise<string> {
  const octokit = new Octokit({
    auth: githubToken
  })

  const githubFile = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref
  })
  if (Array.isArray(githubFile)) {
    throw new Error('File not found')
  }

  const file = githubFile.data as IGithubFile
  return Buffer.from(file.content, 'base64').toString()
}
