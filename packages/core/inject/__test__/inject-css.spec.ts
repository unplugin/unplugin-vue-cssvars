import { describe, expect, test } from 'vitest'
import { injectCssOnBuild, injectCssOnServer, removeStyleTagsAndContent } from '../inject-css'
describe('inject-css', () => {
  test('injectCssOnServer: basic', () => {
    const code = 'v-bind-m(foo)'
    const vbindVariableList = [{ value: 'foo', hash: 'hash' }]
    expect(injectCssOnServer(code, vbindVariableList as any)).toBe('var(--hash)')
  })

  test('injectCssOnServer: vbindVariableList is undefined', () => {
    const code = 'v-bind-m(foo)'
    expect(injectCssOnServer(code, undefined)).toBe(code)
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

    expect(removeStyleTagsAndContent(html)).toEqual(expectedHtml)
  })

  test('removeStyleTagsAndContent: empty HTML', () => {
    expect(removeStyleTagsAndContent('')).toEqual('')
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

    expect(removeStyleTagsAndContent(html)).toEqual(html)
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
    const injectCSSContent = new Set([{ content: '@import \'./assets/scss/foo.scss\';\nbody { background-color: black; }', lang: 'scss' }])
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
    const result = injectCssOnBuild(code, injectCSSContent, descriptor as any)
    expect(result).toMatchSnapshot()
  })

  test('injectCssOnBuild: no styles', () => {
    const code = 'test'
    const injectCSSContent = new Set([{ content: '@import \'./assets/scss/foo.scss\';\nbody { background-color: black; }', lang: 'scss' }])
    const descriptor = {
      styles: null,
    }
    const result = injectCssOnBuild(code, injectCSSContent, descriptor as any)
    expect(result).toMatchSnapshot()
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
    const injectCSSContent = new Set([{ content: '@import \'./assets/scss/foo.scss\';\nbody { background-color: black; }', lang: 'scss' }])
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
    const result = injectCssOnBuild(code, injectCSSContent, descriptor as any)
    expect(result).toMatchSnapshot()
  })
})
