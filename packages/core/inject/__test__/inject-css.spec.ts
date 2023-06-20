import { describe, expect, test } from 'vitest'
import MagicString from 'magic-string'
import { injectCSSOnServer, injectCssOnBuild, removeStyleTagsAndContent } from '../inject-css'
describe('inject-css', () => {
  test('injectCSSOnServer: basic', () => {
    const code = 'v-bind-m(foo)'
    const mgcStr = new MagicString(code)
    const vbindVariableList = [{ value: 'foo', hash: 'hash' }]
    expect(injectCSSOnServer(mgcStr, vbindVariableList as any, false).toString()).toBe('var(--hash)')
  })

  test('injectCSSOnServer: vbindVariableList is undefined', () => {
    const code = 'v-bind-m(foo)'
    const mgcStr = new MagicString(code)
    expect(injectCSSOnServer(mgcStr, undefined, false).toString()).toBe('var(foo)')
  })

  test('removeStyleTagsAndContent: basic', () => {
    const html = `
      <html>
        <head>
          <title>Test</title>
          <style>
            body {
              background-color: red;
            }
          </style>
        </head>
        <body>
          <h1>Hello, world!</h1>
          <p>This is a test.</p>
          <style type="text/css">
            p {
              font-size: 16px;
            }
          </style>
        </body>
      </html>
    `

    const expectedHtml = `
      <html>
        <head>
          <title>Test</title>
          
        </head>
        <body>
          <h1>Hello, world!</h1>
          <p>This is a test.</p>
          
        </body>
      </html>
    `
    const mgcStr = new MagicString(html)
    expect(removeStyleTagsAndContent(mgcStr).toString()).toEqual(expectedHtml)
  })

  test('removeStyleTagsAndContent: empty HTML', () => {
    const mgcStr = new MagicString('')
    expect(removeStyleTagsAndContent(mgcStr).toString()).toEqual('')
  })

  test('removeStyleTagsAndContent: not modify HTML without style tags', () => {
    const html = `
      <html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <h1>Hello, world!</h1>
          <p>This is a test.</p>
        </body>
      </html>
    `
    const mgcStr = new MagicString(html)
    expect(removeStyleTagsAndContent(mgcStr).toString()).toEqual(html)
  })

  test('injectCssOnBuild: basic', () => {
    const code = '<style lang="scss">\n'
      + '/* foo.scss -> test2.css -> test.css */\n'
      + '/* foo.scss -> test.scss -> test2.css */\n'
      + '\n'
      + '/*@import "./assets/less/less-foo";*/\n'
      + 'div {\n'
      + '  color: v-bind(color)\n'
      + '}\n'
      + "@import './assets/scss/foo.scss';\n"
      + '</style>'
    const mgcStr = new MagicString(code)
    const injectCSSContent = new Set([{
      content: '@import \'./assets/scss/foo.scss\';\nbody { background-color: black; }',
      lang: 'scss',
      styleTagIndex: 0,
    }])
    const descriptor = {
      styles: [
        {
          lang: 'scss',
          content: '/* foo.scss -> test2.css -> test.css */\n'
            + '/* foo.scss -> test.scss -> test2.css */\n'
            + '\n'
            + '/*@import "./assets/less/less-foo";*/\n'
            + 'div {\n'
            + '  color: v-bind(color)\n'
            + '}\n'
            + "@import './assets/scss/foo.scss';",
        },
      ],
    }
    const result = injectCssOnBuild(mgcStr, injectCSSContent, descriptor as any)
    expect(result.toString()).toMatchSnapshot()
  })

  // fix: #53
  test('injectCssOnBuild: mutiple style tags', () => {
    const code = '<style lang="scss">\n'
      + '/* foo.scss -> test2.css -> test.css */\n'
      + '/* foo.scss -> test.scss -> test2.css */\n'
      + '\n'
      + '/*@import "./assets/less/less-foo";*/\n'
      + 'div {\n'
      + '  color: v-bind(color)\n'
      + '}\n'
      + "@import './assets/scss/foo.scss';\n"
      + '</style> '
      + '<style lang="scss">\n'
      + '  .el-popup-parent--hidden {\n'
      + '    .fixed-header {\n'
      + '      padding-right: 17px;\n'
      + '    }\n'
      + '  }\n'
      + '</style>'
    const mgcStr = new MagicString(code)
    const injectCSSContent = new Set([{
      content: '@import \'./assets/scss/foo.scss\';\nbody { background-color: black; }',
      lang: 'scss',
      styleTagIndex: 0,
    }])
    const descriptor = {
      styles: [
        {
          lang: 'scss',
          content: '/* foo.scss -> test2.css -> test.css */\n'
            + '/* foo.scss -> test.scss -> test2.css */\n'
            + '\n'
            + '/*@import "./assets/less/less-foo";*/\n'
            + 'div {\n'
            + '  color: v-bind(color)\n'
            + '}\n'
            + "@import './assets/scss/foo.scss';",
        },
        {
          lang: 'scss',
          content: ' .el-popup-parent--hidden {\n'
            + '    .fixed-header {\n'
            + '      padding-right: 17px;\n'
            + '    }\n'
            + '  }',
        },
      ],
    }
    const result = injectCssOnBuild(mgcStr, injectCSSContent, descriptor as any)
    expect(result.toString()).toMatchSnapshot()
  })

  test('injectCssOnBuild: no styles', () => {
    const code = 'test'
    const injectCSSContent = new Set([{
      content: '@import \'./assets/scss/foo.scss\';\nbody { background-color: black; }',
      lang: 'scss',
      styleTagIndex: 0,
    }])
    const descriptor = {
      styles: null,
    }
    const mgcStr = new MagicString(code)
    const result = injectCssOnBuild(mgcStr, injectCSSContent, descriptor as any)
    expect(result.toString()).toMatchSnapshot()
  })

  test('injectCssOnBuild: no lang', () => {
    const code = '<style lang="scss">\n'
      + '/* foo.scss -> test2.css -> test.css */\n'
      + '/* foo.scss -> test.scss -> test2.css */\n'
      + '\n'
      + '/*@import "./assets/less/less-foo";*/\n'
      + 'div {\n'
      + '  color: v-bind(color)\n'
      + '}\n'
      + "@import './assets/scss/foo.scss';\n"
      + '</style>'
    const injectCSSContent = new Set([{
      content: '@import \'./assets/scss/foo.scss\';\nbody { background-color: black; }',
      lang: 'scss',
      styleTagIndex: 0,
    }])
    const descriptor = {
      styles: [
        {
          lang: null,
          content: '/* foo.scss -> test2.css -> test.css */\n'
            + '/* foo.scss -> test.scss -> test2.css */\n'
            + '\n'
            + '/*@import "./assets/less/less-foo";*/\n'
            + 'div {\n'
            + '  color: v-bind(color)\n'
            + '}\n'
            + "@import './assets/scss/foo.scss';",
        },
      ],
    }
    const mgcStr = new MagicString(code)
    const result = injectCssOnBuild(mgcStr, injectCSSContent, descriptor as any)
    expect(result.toString()).toMatchSnapshot()
  })
})
