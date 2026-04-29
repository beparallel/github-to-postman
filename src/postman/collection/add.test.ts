import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { addCollection } from './add'

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} })
  }
}))

describe('addCollection', () => {
  beforeEach(() => {
    vi.mocked(axios.post).mockClear()
  })

  it('POSTs the collection to the Postman API with the API key header', async () => {
    const collection: Record<string, unknown> = {
      info: { name: 'My API', schema: '...' },
      item: []
    }
    await addCollection(collection, 'ws-abc', 'secret-key')

    expect(axios.post).toHaveBeenCalledTimes(1)
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.getpostman.com/collections?workspace=ws-abc',
      { collection },
      {
        headers: {
          'x-api-key': 'secret-key'
        }
      }
    )
  })

  it('URL-encodes the workspace query parameter', async () => {
    await addCollection({}, 'space id', 'k')

    expect(axios.post).toHaveBeenCalledWith(
      'https://api.getpostman.com/collections?workspace=space%20id',
      { collection: {} },
      expect.objectContaining({
        headers: { 'x-api-key': 'k' }
      })
    )
  })
})
