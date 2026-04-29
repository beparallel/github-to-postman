import axios from 'axios'

export { addCollection }

async function addCollection(
  collection: Record<string, unknown>,
  workspace: string,
  postmanApiKey: string
): Promise<void> {
  await axios.post(
    `https://api.getpostman.com/collections?workspace=${encodeURIComponent(workspace)}`,
    { collection },
    {
      headers: {
        'x-api-key': postmanApiKey
      }
    }
  )
}
