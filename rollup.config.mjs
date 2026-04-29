import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

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
    })
  ],
  treeshake: true
}
