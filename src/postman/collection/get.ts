import { Collection } from './types'

import axios from 'axios'

export { getAllCollections }

async function getAllCollections(
  workspace: string,
  postmanApiKey: string
): Promise<Collection[]> {
  const response = await axios.get(
    `https://api.getpostman.com/collections?workspace=${workspace}`,
    {
      headers: {
        'x-api-key': postmanApiKey
      }
    }
  )
  return response.data.collections
}
