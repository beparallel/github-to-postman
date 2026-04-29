import * as core from '@actions/core'
import * as path from 'path'
import { addCollection } from './add'
import { convertOpenApiToCollection } from './convert'
import { deleteCollection } from './delete'
import { getAllCollections } from './get'
import { rewriteBaseUrl } from './rewriteBaseUrl'

import { Collection } from './types'

export { getCollectionName, syncCollectionWithPostman }

function getCollectionName(filePath: string): string {
  const fileName = path.basename(filePath)
  const a2 = fileName.split('.')
  return a2[0]
}

async function syncCollectionWithPostman({
  collectionName,
  workspace,
  postmanApiKey,
  openapiDocument,
  baseUrlKeyName
}: {
  collectionName: string
  workspace: string
  postmanApiKey: string
  openapiDocument: Record<string, unknown>
  baseUrlKeyName: string
}): Promise<string> {
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

  let collection = await convertOpenApiToCollection(openapiDocument)
  const existingInfo =
    typeof collection.info === 'object' &&
    collection.info !== null &&
    !Array.isArray(collection.info)
      ? collection.info
      : {}
  collection = {
    ...collection,
    info: {
      ...existingInfo,
      name: collectionName
    }
  }

  if (baseUrlKeyName) {
    collection = rewriteBaseUrl(collection, baseUrlKeyName)
  }

  await addCollection(collection, workspace, postmanApiKey)

  return 'ok'
}
