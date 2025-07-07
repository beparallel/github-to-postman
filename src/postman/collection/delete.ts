import axios from 'axios'

export { deleteCollection }
async function deleteCollection(
  collectionUId: string,
  postmanApiKey: string
): Promise<void> {
  await axios.delete(
    `https://api.getpostman.com/collections/${collectionUId}`,
    {
      headers: {
        'x-api-key': postmanApiKey
      }
    }
  )
}
