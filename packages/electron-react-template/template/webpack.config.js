const path = require('path')
const fs = require('fs')
const dirs = fs.readdirSync('children-pages-src')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const entry = {
  vendors: ['./node_modules/electron-store']
}
const plugins = []
dirs.forEach((dir) => {
  entry[dir] = {
    import: path.resolve(__dirname, './children-pages-src', `${dir}/index.js`),
    dependOn: 'vendors'
  }
  plugins.push(new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './children-pages-src', `${dir}/index.html`),
    filename: `${dir}.html`,
    chunks: [`${dir}`]
  }))
})

module.exports = {
  mode: 'production',
  target: 'electron-main',
  entry,
  output: {
    path: path.resolve(__dirname, './children-pages-build'),
    filename: '[name].js',
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  },
  plugins,
  node: {
    __dirname: false
  }
}