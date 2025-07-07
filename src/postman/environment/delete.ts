import axios from 'axios'

export { deleteEnvironment }
async function deleteEnvironment(
  environmentId: string,
  postmanApiKey: string
): Promise<void> {
  await axios.delete(
    `https://api.getpostman.com/environments/${environmentId}`,
    {
      headers: {
        'x-api-key': postmanApiKey
      }
    }
  )
}
