import axios from 'axios'

export { addCollection }

async function addCollection(
  input: string,
  workspace: string,
  postmanApiKey: string
): Promise<void> {
  await axios.post(
    'https://api.getpostman.com/import/openapi',
    {
      workspace,
      type: 'json',
      input
    },
    {
      headers: {
        'x-api-key': postmanApiKey
      }
    }
  )
}
