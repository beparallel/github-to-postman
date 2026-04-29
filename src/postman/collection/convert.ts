import { convertV2 } from 'openapi-to-postmanv2'

export { convertOpenApiToCollection }

/**
 * Converts an OpenAPI 2/3 definition (already parsed JSON) to a Postman Collection v2.1-compatible object.
 */
async function convertOpenApiToCollection(
  openapiDocument: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    convertV2(
      { type: 'json', data: openapiDocument },
      { folderStrategy: 'Tags' },
      (err, result) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(String(err)))
          return
        }
        if (!result?.result || !result.output?.length) {
          reject(
            new Error(
              typeof result?.reason === 'string'
                ? result.reason
                : 'OpenAPI conversion failed'
            )
          )
          return
        }
        const first = result.output.find(entry => entry.type === 'collection')
        if (!first?.data || typeof first.data !== 'object') {
          reject(new Error('OpenAPI conversion returned no collection object'))
          return
        }
        resolve(first.data)
      }
    )
  })
}
