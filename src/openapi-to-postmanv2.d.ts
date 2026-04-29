/**
 * Minimal typings for openapi-to-postmanv2 — the npm package publishes JS only.
 */

declare module 'openapi-to-postmanv2' {
  export type SpecificationInput =
    | { type: 'file'; data: string }
    | { type: 'string'; data: string }
    | { type: 'json'; data: Record<string, unknown> }

  export interface ConversionOptions {
    folderStrategy?: string
    [option: string]: unknown
  }

  export interface ConversionResult {
    result: boolean
    reason?: string
    output?: Array<{ type: string; data: Record<string, unknown> }>
  }

  export type ConvertCallback = (
    err: Error | null,
    result?: ConversionResult
  ) => void

  export function convertV2(
    input: SpecificationInput,
    options: ConversionOptions,
    cb: ConvertCallback
  ): void
}
