import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const localImports = process.env.LOCALIMPORTS

const minificationPlugins = process.env.PRODUCTION ? [terser({
  module: true,
  compress: {
    hoist_vars: true,
    module: true,
    passes: 1,
    pure_getters: true,
    unsafe_comps: true,
    unsafe_undefined: true
  },
  mangle: {
    toplevel: true
  }
})] : []

const customModules = new Set([
  'y-websocket',
  'y-codemirror',
  'y-ace',
  'y-textarea',
  'y-quill',
  'y-dom',
  'y-prosemirror',
  'd-components'
])
/**
 * @type {Set<any>}
 */
const customLibModules = new Set([
  'lib0',
  'y-protocols'
])

const debugResolve = {
  resolveId (importee) {
    if (localImports) {
      if (importee === 'd-components') {
        return `${process.cwd()}/../${importee}/src/index.js`
      }
      if (customModules.has(importee.split('/')[0])) {
        return `${process.cwd()}/../${importee}/src/${importee}.js`
      }
      if (customLibModules.has(importee.split('/')[0])) {
        return `${process.cwd()}/../${importee}`
      }
    }
    return null
  }
}

export default [{
  input: [
    './demos/conference.js',
    './demos/whiteboard.js'
  ],
  output: {
    name: 'demo',
    dir: 'demos/dist',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    debugResolve,
    nodeResolve({
      mainFields: ['module', 'browser', 'main']
    }),
    commonjs(),
    ...minificationPlugins
  ]
}]
