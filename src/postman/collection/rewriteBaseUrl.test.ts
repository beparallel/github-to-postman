import { describe, expect, it } from 'vitest'

import { rewriteBaseUrl } from './rewriteBaseUrl'

describe('rewriteBaseUrl', () => {
  it('replaces {{baseUrl}} in nested JSON and renames the root collection variable', () => {
    const input: Record<string, unknown> = {
      info: { name: 'API' },
      variable: [
        { key: 'baseUrl', value: 'https://api.example.com', type: 'string' }
      ],
      item: [
        {
          request: {
            url: {
              raw: '{{baseUrl}}/v1/users',
              host: ['{{baseUrl}}'],
              path: ['v1', 'users']
            }
          }
        }
      ],
      description: 'Call {{baseUrl}} for help'
    }

    const out = rewriteBaseUrl(input, 'stagingBaseUrl')

    expect(out.variable).toEqual([
      {
        key: 'stagingBaseUrl',
        value: 'https://api.example.com',
        type: 'string'
      }
    ])
    const item = (out.item as Record<string, unknown>[])[0] as {
      request: { url: Record<string, unknown> }
    }
    expect(item.request.url.raw).toBe('{{stagingBaseUrl}}/v1/users')
    expect(item.request.url.host).toEqual(['{{stagingBaseUrl}}'])
    expect(out.description).toBe('Call {{stagingBaseUrl}} for help')
  })

  it('leaves collection unchanged when there is no variable array', () => {
    const input: Record<string, unknown> = { info: { name: 'X' } }
    const out = rewriteBaseUrl(input, 'k')
    expect(out).toEqual({ info: { name: 'X' } })
  })
})
