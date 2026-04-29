import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

/** Normalize emitted files to LF so committed `dist/` matches `.gitattributes` (`eol=lf`) on Windows/macOS. */
function emitLfOnly() {
  return {
    name: 'emit-lf-only',
    generateBundle(_options, bundle) {
      for (const artifact of Object.values(bundle)) {
        if (artifact.type === 'chunk' && artifact.code.includes('\r')) {
          artifact.code = artifact.code.replace(/\r\n/g, '\n')
        }
        if (
          artifact.type === 'asset' &&
          typeof artifact.source === 'string' &&
          artifact.source.includes('\r')
        ) {
          artifact.source = artifact.source.replace(/\r\n/g, '\n')
        }
      }
    }
  }
}

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/index.mjs',
    format: 'esm',
    sourcemap: true
  },
  /** Mixed CJS deps (@actions/core, openapi-to-postmanv2, semver) emit noisy but harmless warnings when bundled as ESM. */
  onwarn(warning, defaultHandler) {
    if (
      warning.code === 'THIS_IS_UNDEFINED' ||
      warning.code === 'CIRCULAR_DEPENDENCY'
    ) {
      return
    }
    defaultHandler(warning)
  },
  plugins: [
    nodeResolve({
      preferBuiltins: true,
      exportConditions: ['node', 'import', 'default']
    }),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        module: 'ESNext',
        moduleResolution: 'Bundler',
        rootDir: './src'
      }
    }),
    json(),
    commonjs({
      transformMixedEsModules: true,
      strictRequires: 'auto'
    }),
    emitLfOnly()
  ],
  treeshake: true
}
