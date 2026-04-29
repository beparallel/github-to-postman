import 'dotenv/config'

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

import { Command } from 'commander'

import {
  getCollectionName,
  syncCollectionWithPostman
} from './postman/collection/sync'

async function main(): Promise<void> {
  const program = new Command()
  program
    .name('sync-local')
    .description(
      'Push a local OpenAPI JSON file to Postman (developer CLI). Requires POSTMAN_API_KEY.'
    )
    .argument('<spec>', 'Path to OpenAPI JSON file')
    .option('--workspace-id <id>', 'Postman workspace ID')
    .option(
      '--collection-name <name>',
      'Collection name (default: stem of the spec file)'
    )
    .option(
      '--base-url-key <key>',
      'Rewrite {{baseUrl}} to {{key}} in the generated collection; omit to skip'
    )
    .action(
      async (
        spec: string,
        opts: {
          workspaceId?: string
          collectionName?: string
          baseUrlKey?: string
        }
      ) => {
        const apiKey = process.env.POSTMAN_API_KEY?.trim()
        if (!apiKey) {
          process.stderr.write(
            'Error: POSTMAN_API_KEY is required (set in the environment or in a .env file).\n'
          )
          process.exitCode = 1
          return
        }

        const workspaceId =
          opts.workspaceId?.trim() || process.env.POSTMAN_WORKSPACE_ID?.trim()
        if (!workspaceId) {
          process.stderr.write(
            'Error: workspace ID is required (pass --workspace-id or set POSTMAN_WORKSPACE_ID).\n'
          )
          process.exitCode = 1
          return
        }

        const resolvedSpec = path.resolve(spec)
        let raw: string
        try {
          raw = readFileSync(resolvedSpec, 'utf8')
        } catch (e) {
          process.stderr.write(
            `Error: could not read spec file: ${resolvedSpec}\n${String(e)}\n`
          )
          process.exitCode = 1
          return
        }

        let openapiDocument: Record<string, unknown>
        try {
          openapiDocument = JSON.parse(raw) as Record<string, unknown>
        } catch (e) {
          process.stderr.write(
            `Error: invalid JSON in ${resolvedSpec}\n${String(e)}\n`
          )
          process.exitCode = 1
          return
        }

        const collectionName =
          opts.collectionName?.trim() ||
          process.env.POSTMAN_COLLECTION_NAME?.trim() ||
          getCollectionName(resolvedSpec)

        const tmpDir = mkdtempSync(path.join(tmpdir(), 'postman-sync-'))
        const ghOutputFile = path.join(tmpDir, 'github_output')
        writeFileSync(ghOutputFile, '')
        const prevGithubOutput = process.env.GITHUB_OUTPUT
        process.env.GITHUB_OUTPUT = ghOutputFile

        try {
          await syncCollectionWithPostman({
            collectionName,
            workspace: workspaceId,
            postmanApiKey: apiKey,
            openapiDocument,
            baseUrlKeyName: opts.baseUrlKey ?? ''
          })
        } finally {
          if (prevGithubOutput === undefined) {
            delete process.env.GITHUB_OUTPUT
          } else {
            process.env.GITHUB_OUTPUT = prevGithubOutput
          }
          rmSync(tmpDir, { recursive: true, force: true })
        }

        console.log(
          `Synced collection "${collectionName}" to workspace ${workspaceId}`
        )
        console.log(`Spec: ${resolvedSpec}`)
      }
    )

  await program.parseAsync(process.argv)
}

main().catch((err: unknown) => {
  process.stderr.write(`${String(err)}\n`)
  process.exitCode = 1
})
