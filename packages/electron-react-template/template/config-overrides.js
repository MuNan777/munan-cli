const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const closedMap = config => {
  config.target = 'electron-main'
  config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : false
  config.plugins.push(...[new NodePolyfillPlugin()])
  return config;
};
const {
  override,
} = require("customize-cra");
module.exports = {
  webpack: override(
    closedMap
  )
}