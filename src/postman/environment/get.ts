import { Environment } from './types'

import axios from 'axios'

export { getAllEnvironments }

async function getAllEnvironments(
  workspace: string,
  postmanApiKey: string
): Promise<Environment[]> {
  const response = await axios.get(
    `https://api.getpostman.com/environments?workspace=${workspace}`,
    {
      headers: {
        'x-api-key': postmanApiKey
      }
    }
  )
  return response.data.environments
}
