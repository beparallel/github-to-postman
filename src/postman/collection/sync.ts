/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable sort-imports */
import * as core from '@actions/core'
import { addCollection } from './add'
import { deleteCollection } from './delete'
import { getAllCollections } from './get'

import { Collection } from './types'

export { syncCollectionWithPostman }

async function syncCollectionWithPostman({
  githubPath,
  workspace,
  postmanApiKey,
  jsonfileContent
}: {
  githubPath: string
  workspace: string
  postmanApiKey: string
  jsonfileContent: string
}): Promise<string> {
  core.setOutput('githubPath', githubPath)
  const collectionName = getCollectionName(githubPath)
  core.setOutput('collectionName', collectionName)

  const collections = await getAllCollections(workspace, postmanApiKey)
  const filterCollections = collections.filter(
    (e: Collection) => e.name === collectionName
  )
  await Promise.all(
    filterCollections.map(async (collection: Collection) =>
      deleteCollection(collection.uid, postmanApiKey)
    )
  )

  await addCollection(jsonfileContent, workspace, postmanApiKey)

  return 'ok'
}

function getCollectionName(githubPath: string): string {
  const a = githubPath.split('/')
  const fileName = a[a.length - 1]
  const a2 = fileName.split('.')
  return a2[0]
}
