# GitHub to Postman

A GitHub Action that syncs a **Postman collection** or **environment** from a
file (typically an OpenAPI / Swagger or Postman JSON) hosted in a GitHub
repository into a Postman workspace.

For **collections**, it fetches an OpenAPI (or Swagger) JSON from GitHub,
converts it locally to a Postman Collection, optionally rewrites every
`{{baseUrl}}` reference (and renames the auto-generated collection variable) to
match `baseUrlKeyName`, deletes any existing workspace collection with the same
inferred name (from the file stem), then creates the new collection via the
Postman API. **Environments** are synced as plain Postman environment JSON.

## Usage

Add a workflow that calls this action. Example — sync a collection on every push
to `main`:

```yaml
name: Sync Postman collection

on:
  push:
    branches: [main]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: parallel-finance/github-to-postman@v1
        with:
          sync: collection
          postman-api-key: ${{ secrets.POSTMAN_API_KEY }}
          workspace-id: ${{ secrets.POSTMAN_WORKSPACE_ID }}
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          githubOwner: my-org
          githubRepo: my-api-repo
          githubPath: openapi/spec.json
          githubRef: main
```

Sync an environment instead by setting `sync: environment` and (optionally)
providing secrets that should be injected into the environment:

```yaml
- uses: parallel-finance/github-to-postman@v1
  with:
    sync: environment
    postman-api-key: ${{ secrets.POSTMAN_API_KEY }}
    workspace-id: ${{ secrets.POSTMAN_WORKSPACE_ID }}
    githubToken: ${{ secrets.GITHUB_TOKEN }}
    githubOwner: my-org
    githubRepo: my-api-repo
    githubPath: postman/staging.environment.json
    githubRef: main
    postmanEnvSecret1: ${{ secrets.POSTMAN_ENV_SECRET_1 }}
    postmanEnvSecret2: ${{ secrets.POSTMAN_ENV_SECRET_2 }}
    baseUrlKeyName: stagingBaseUrl
```

### Inputs

| Input               | Required | Description                                                                                                                                                                                                                                                              |
| ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sync`              | yes      | What to sync. Either `collection` or `environment`.                                                                                                                                                                                                                      |
| `postman-api-key`   | yes      | Postman API key.                                                                                                                                                                                                                                                         |
| `workspace-id`      | yes      | ID of the Postman workspace that owns the collection / environment.                                                                                                                                                                                                      |
| `githubToken`       | yes      | Token used to read the source file from GitHub (e.g. `${{ secrets.GITHUB_TOKEN }}`).                                                                                                                                                                                     |
| `githubOwner`       | yes      | Owner of the GitHub repo containing the source file.                                                                                                                                                                                                                     |
| `githubRepo`        | yes      | Name of the GitHub repo containing the source file.                                                                                                                                                                                                                      |
| `githubPath`        | yes      | Path to the file inside that repo (e.g. `openapi/spec.json`).                                                                                                                                                                                                            |
| `githubRef`         | yes      | Git ref to read from (branch, tag, or SHA). Defaults to `main` in code.                                                                                                                                                                                                  |
| `postmanEnvSecret1` | no       | Optional secret value injected into the synced environment.                                                                                                                                                                                                              |
| `postmanEnvSecret2` | no       | Optional secret value injected into the synced environment.                                                                                                                                                                                                              |
| `baseUrlKeyName`    | no       | **Collection sync only.** After OpenAPI→Postman conversion, every `{{baseUrl}}` in the generated collection is rewritten to `{{<baseUrlKeyName>}}`, and the root collection variable formerly named `baseUrl` is renamed to match. Ignored when `sync` is `environment`. |

### Outputs

| Output           | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| `workspace`      | The workspace ID that was targeted.                                       |
| `githubPath`     | **Collection sync only.** The `githubPath` input (repo path to the spec). |
| `path`           | The normalized path used to fetch the file.                               |
| `fileContent`    | Raw contents of the file fetched from GitHub.                             |
| `collectionName` | **Collection sync only.** Resolved Postman collection name (file stem).   |
| `error`          | Error object, if the action failed.                                       |

## Development

This project uses **pnpm** (pinned via `packageManager` in `package.json`) and
ships a bundled ESM file `dist/index.mjs` consumed by the action runtime (Node
24).

### Setup

```bash
pnpm install
```

> Do not run `npm install` — the project uses a pnpm-managed `node_modules` and
> npm's tree resolver will crash on the symlinked layout.

### Useful scripts

| Script                     | What it does                                                            |
| -------------------------- | ----------------------------------------------------------------------- |
| `pnpm package`             | Bundle `src/main.ts` to `dist/index.mjs` with Rollup (ESM, sourcemaps). |
| `pnpm package:watch`       | Same as `package`, in watch mode.                                       |
| `pnpm bundle` / `pnpm all` | Format the codebase, then re-bundle.                                    |
| `pnpm test`                | Run Vitest once (`vitest run`).                                         |
| `pnpm test:watch`          | Vitest in watch mode.                                                   |
| `pnpm format:write`        | Format with Prettier.                                                   |
| `pnpm format:check`        | Check formatting without writing.                                       |
| `pnpm lint`                | Run ESLint with the repo config (`eslint.config.mjs`).                  |
| `pnpm typecheck`           | Type-check with `tsc --noEmit`.                                         |
| `pnpm sync-local`          | Developer CLI: push a **local** OpenAPI JSON to Postman (see below).    |

### Git hooks

[Husky](https://typicode.github.io/husky/) runs **`pnpm typecheck`**,
**`pnpm lint`**, and **`pnpm test`** on every commit (via `.husky/pre-commit`).
The `prepare` script installs hooks after `pnpm install`.

### Local testing (`sync-local`)

For manual runs against Postman without GitHub Actions, copy
[`.env.example`](.env.example) to `.env` and set **`POSTMAN_API_KEY`** (and
optionally **`POSTMAN_WORKSPACE_ID`** / **`POSTMAN_COLLECTION_NAME`**). The CLI
loads `.env` automatically via `dotenv`.

```bash
pnpm sync-local ./swagger/iam.swagger.json \
  --workspace-id <your-postman-workspace-uuid> \
  --collection-name "iam" \
  --base-url-key iamUrl
```

- **`POSTMAN_API_KEY`**: required (environment or `.env`); never pass it as a
  CLI flag.
- Positional **`<spec>`**: path to OpenAPI (or Swagger) **JSON** on disk.
- **`--workspace-id`**: required unless `POSTMAN_WORKSPACE_ID` is set.
- **`--collection-name`**: optional; falls back to `POSTMAN_COLLECTION_NAME`,
  then to the spec file’s basename without extension.
- **`--base-url-key`**: optional; same meaning as the action’s `baseUrlKeyName`
  (omit to skip URL rewrite).

The action bundle remains **`dist/index.mjs`** from `main.ts` only; the CLI is
**not** shipped in that bundle and uses `tsx` at dev time.

### Project layout

```pn
src/
  main.ts              # Action entry point — reads inputs, fetches file, dispatches sync
  cli.ts               # Dev-only: local OpenAPI file -> Postman (pnpm sync-local)
  github/              # GitHub file-fetching helpers
  postman/
    collection/sync.ts     # Delete old + create collection (convert + optional base URL rewrite)
    collection/convert.ts   # openapi-to-postmanv2 wrapper
    collection/rewriteBaseUrl.ts # {{baseUrl}} → {{baseUrlKeyName}}
    environment/sync.ts# Upsert a Postman environment
action.yml             # Action metadata (inputs, runtime, entry point)
rollup.config.mjs      # Rollup config for the action ESM bundle
dist/                  # Bundled output committed to the repo (consumed by Actions)
```

### Releasing

GitHub Actions runs the bundled `dist/index.mjs` directly from the repo, so the
bundle must be committed for any change you want to ship:

```bash
pnpm upgrade --latest
pnpm install
pnpm all
gaa
git commit -m "chore: rebuild dist"
git push origin X
```

Then move the version tag (e.g. `v1`) to the new commit so consumers picking up
`@v1` get the update. See the
[action versioning guide](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
for the recommended tagging strategy.

## License

MIT
