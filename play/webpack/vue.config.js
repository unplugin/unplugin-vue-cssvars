const { resolve } = require('path')
const { defineConfig } = require('@vue/cli-service')
const { webpackVueCSSVars } = require('../../dist/index.cjs')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      webpackVueCSSVars({
        include: [/.vue/],
        includeCompile: ['**/**.scss', '**/**.css'],
        alias: {
          '@': resolve(__dirname, './src'),
        },
        server: true,
      }),
    ],
  },
})
