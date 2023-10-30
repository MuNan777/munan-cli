const typescript = require('rollup-plugin-typescript2');
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const rimraf = require('rimraf')

rimraf.sync('out/extension')

module.exports = {
  input: {
    'extension/index': './src/extension/index.ts',
  },
  output: [
    {
      dir: 'out',
      format: 'cjs',
      entryFileNames: '[name].js',
      sourcemap: true,
    },
  ],
  external: ['vscode'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
    nodeResolve(),
    commonjs()
  ],
};