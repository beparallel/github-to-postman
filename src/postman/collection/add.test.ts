/* eslint-disable @typescript-eslint/unbound-method -- axios is fully mocked; expectations reference mocked methods */
import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { addCollection } from './add'

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} })
  }
}))

describe('addCollection', () => {
  // axios.post is mocked; extracting reference triggers unbound-method without bind noise.
  const mockedPost = vi.mocked(axios).post

  beforeEach(() => {
    mockedPost.mockClear()
  })

  it('POSTs the collection to the Postman API with the API key header', async () => {
    const collection: Record<string, unknown> = {
      info: { name: 'My API', schema: '...' },
      item: []
    }
    await addCollection(collection, 'ws-abc', 'secret-key')

    expect(mockedPost).toHaveBeenCalledTimes(1)
    expect(mockedPost).toHaveBeenCalledWith(
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

    expect(mockedPost).toHaveBeenCalledWith(
      'https://api.getpostman.com/collections?workspace=space%20id',
      { collection: {} },
      expect.objectContaining({
        headers: { 'x-api-key': 'k' }
      })
    )
  })
})
