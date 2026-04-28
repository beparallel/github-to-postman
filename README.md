# GitHub to Postman

A GitHub Action that syncs a **Postman collection** or **environment** from a
file (typically an OpenAPI / Swagger or Postman JSON) hosted in a GitHub
repository into a Postman workspace.

It fetches the file from GitHub, optionally rewrites the `{{baseUrl}}`
placeholder, then upserts it into Postman via the Postman API.

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

| Input               | Required | Description                                                                                                           |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `sync`              | yes      | What to sync. Either `collection` or `environment`.                                                                   |
| `postman-api-key`   | yes      | Postman API key.                                                                                                      |
| `workspace-id`      | yes      | ID of the Postman workspace that owns the collection / environment.                                                   |
| `githubToken`       | yes      | Token used to read the source file from GitHub (e.g. `${{ secrets.GITHUB_TOKEN }}`).                                  |
| `githubOwner`       | yes      | Owner of the GitHub repo containing the source file.                                                                  |
| `githubRepo`        | yes      | Name of the GitHub repo containing the source file.                                                                   |
| `githubPath`        | yes      | Path to the file inside that repo (e.g. `openapi/spec.json`).                                                         |
| `githubRef`         | yes      | Git ref to read from (branch, tag, or SHA). Defaults to `main` in code.                                               |
| `postmanEnvSecret1` | no       | Optional secret value injected into the synced environment.                                                           |
| `postmanEnvSecret2` | no       | Optional secret value injected into the synced environment.                                                           |
| `baseUrlKeyName`    | no       | If set, every `{{baseUrl}}` in the source file is rewritten to `{{<baseUrlKeyName>}}` before being pushed to Postman. |

### Outputs

| Output        | Description                                   |
| ------------- | --------------------------------------------- |
| `workspace`   | The workspace ID that was targeted.           |
| `path`        | The normalized path used to fetch the file.   |
| `fileContent` | Raw contents of the file fetched from GitHub. |
| `error`       | Error object, if the action failed.           |

## Development

This project uses **pnpm** (pinned via `packageManager` in `package.json`) and
ships a bundled `dist/index.js` consumed by the action runtime (Node 24).

### Setup

```bash
pnpm install
```

> Do not run `npm install` — the project uses a pnpm-managed `node_modules` and
> npm's tree resolver will crash on the symlinked layout.

### Useful scripts

| Script                     | What it does                                                                      |
| -------------------------- | --------------------------------------------------------------------------------- |
| `pnpm package`             | Bundle `src/main.ts` into `dist/` with `@vercel/ncc` (sourcemaps + license file). |
| `pnpm package:watch`       | Same as `package`, in watch mode.                                                 |
| `pnpm bundle` / `pnpm all` | Format the codebase, then re-bundle.                                              |
| `pnpm format:write`        | Format with Prettier.                                                             |
| `pnpm format:check`        | Check formatting without writing.                                                 |
| `pnpm lint`                | Run ESLint with the repo config.                                                  |

### Project layout

```pn
src/
  main.ts              # Action entry point — reads inputs, fetches file, dispatches sync
  github/              # GitHub file-fetching helpers
  postman/
    collection/sync.ts # Upsert a Postman collection
    environment/sync.ts# Upsert a Postman environment
action.yml             # Action metadata (inputs, runtime, entry point)
dist/                  # Bundled output committed to the repo (consumed by Actions)
```

### Releasing

GitHub Actions runs the bundled `dist/index.js` directly from the repo, so the
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
