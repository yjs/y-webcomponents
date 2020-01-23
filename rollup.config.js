import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

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

export default [{
  input: './demos/index.js',
  output: {
    name: 'demo',
    dir: 'demos/dist',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      mainFields: ['module', 'browser', 'main']
    }),
    commonjs(),
    ...minificationPlugins
  ]
}]
