import { resolve } from 'path'
import { describe, expect, test, vi } from 'vitest'
import * as csstree from 'css-tree'
import { transformSymbol } from '@unplugin-vue-cssvars/utils'
import {
  generateCSSCode,
  getCSSVarsCode,
  getContentNoImporter,
  preProcessCSS,
  setImportToCompileRes,
  walkCSSTree,
} from '../pre-process-css'
import type { ImportStatement } from '../../parser'
const mockVBindPathNode = {
  type: 'Rule',
  loc: null,
  prelude: {
    type: 'SelectorList',
    loc: null,
    children: [
      {
        type: 'Selector',
        loc: null,
        children: [
          {
            type: 'TypeSelector',
            loc: null,
            name: 'div',
          },
        ],
      },
    ],
  },
  block: {
    type: 'Block',
    loc: null,
    children: [
      {
        type: 'Declaration',
        loc: null,
        important: false,
        property: 'color',
        value: {
          type: 'Value',
          loc: null,
          children: [
            {
              type: 'Function',
              loc: null,
              name: 'v-bind',
              children: [
                {
                  type: 'Identifier',
                  loc: null,
                  name: 'color',
                },
              ],
            },
          ],
        },
      },
    ],
  },
}
const mockCSSContent = `
@import "./test";
.foo {
  color: v-bind(color);
  font-size: 20px;
}
.bar {
  color: v-bind(bar);
  font-size: 22px;
}
.test {
 background: blue;
}
`
const delTransformSymbol = (content: string) => content.replace(/[\n\r\t\f\v\\'"]/g, '')
describe('pre process css', () => {
  test('getCSSVarsCode: Rule', () => {
    const mockNode = {
      type: 'Rule',
    }
    const res = getCSSVarsCode(mockNode as any, mockNode as any, null, false)
    expect(res).toMatchObject({
      vBindCode: {},
      vBindPathNode: mockNode,
      vBindEntry: false,
    })
  })

  test('getCSSVarsCode: unmatched logic', () => {
    const mockNode = {
      type: 'foo',
    }
    const res = getCSSVarsCode(
      mockNode as any,
      null,
      { foo: new Set(['foo']) },
      false)
    expect(res).toMatchObject({
      vBindCode: { foo: new Set(['foo']) },
      vBindPathNode: null,
      vBindEntry: false,
    })
  })

  test('getCSSVarsCode: v-bind Function', () => {
    const mockNode = {
      type: 'Function',
      name: 'v-bind',
    }
    const res = getCSSVarsCode(
      mockNode as any,
      mockNode as any,
      null,
      false)
    expect(res).toMatchObject({
      vBindCode: {},
      vBindPathNode: mockNode,
      vBindEntry: true,
    })
  })

  test('getCSSVarsCode: generate code', () => {
    const mockNode = {
      type: 'Identifier',
      loc: null,
      name: 'color',
    }
    const mockVBindCode = { color: new Set<string>() }
    const res = getCSSVarsCode(
      mockNode as any,
      mockVBindPathNode as any,
      mockVBindCode,
      true)
    expect(res).toMatchObject({
      vBindCode: {
        color: new Set<string>(['\n'
        + '/* created by @unplugin-vue-cssvars */\n'
        + '/* <inject start> */\n'
        + 'div{color:v-bind(color)}\n'
        + '/* <inject end> */\n']),
      },
      vBindPathNode: mockVBindPathNode,
      vBindEntry: false,
    })
    expect(res).toMatchSnapshot()
  })

  test('walkCSSTree: basic', () => {
    let res
    const mockEvt = vi.fn()
    const mockCallback = (
      vBindCode: Record<string, Set<string>> | null) => {
      mockEvt()
      res = {
        vBindCode,
      }
    }
    const ast = csstree.parse(mockCSSContent)
    walkCSSTree(ast, mockCallback)
    expect(mockEvt).toBeCalledTimes(1)
    expect(res).toMatchSnapshot()
  })

  test('walkCSSTree: helper i is false', () => {
    let res
    const mockEvt = vi.fn()
    const mockCallback = (
      vBindCode: Record<string, Set<string>> | null) => {
      mockEvt()
      res = {
        vBindCode,
      }
    }
    const ast = csstree.parse(mockCSSContent)
    walkCSSTree(ast, mockCallback)
    expect(mockEvt).toBeCalledTimes(1)
    expect(res).toMatchSnapshot()
  })

  test('preProcessCSS: basic', () => {
    const res = preProcessCSS({ rootDir: resolve('packages') })
    const mockPathTest1 = transformSymbol(`${resolve()}/core/runtime/__test__/style/test.css`)
    const mockPathTest2 = transformSymbol(`${resolve()}/core/runtime/__test__/style/test2.css`)
    const resTest1 = res.get(mockPathTest1)
    const resTest2 = res.get(mockPathTest2)

    expect(resTest1).toBeTruthy()
    expect([...resTest1!.importer][0]).toBe(mockPathTest2)
    expect(resTest1!.vBindCode?.color).toBeTruthy()
    expect(resTest1!.vBindCode).toMatchSnapshot()

    expect(resTest2).toBeTruthy()
    expect(resTest2!.importer.size).toBe(1)
    expect(resTest2!.vBindCode?.appTheme2).toBeTruthy()
    expect(resTest2!.vBindCode).toMatchSnapshot()
  })

  test('preProcessCSS: map path scss -> css or scss', () => {
    const res = preProcessCSS({ rootDir: resolve('packages') })
    const mockPathFooSCSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/foo.scss`)
    const mockPathTestSCSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test.scss`)
    const mockPathTest2CSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test2.css`)
    // foo.scss -> test.css or test.scss ? -> test.scss
    const importerFooSCSS = res.get(mockPathFooSCSS)
    expect([...importerFooSCSS!.importer][0]).toBe(mockPathTestSCSS)
    // foo.scss -> test.css or test.scss ? -> test.scss -> test2.css
    const importerTestSCSS = res.get(mockPathTestSCSS)
    expect([...importerTestSCSS!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.scss -> test2.css
    const mockPathFoo2SCSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/foo2.scss`)
    const mockPathTestCSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test.css`)
    const importerFoo2SCSS = res.get(mockPathFoo2SCSS)
    expect([...importerFoo2SCSS!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.scss ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('preProcessCSS: map path less -> css or less', () => {
    const res = preProcessCSS({ rootDir: resolve('packages') })
    const mockPathFooLESS = transformSymbol(`${resolve()}/core/runtime/__test__/style/foo.less`)
    const mockPathTestLESS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test.less`)
    const mockPathTest2CSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test2.css`)
    // foo.less -> test.css or test.less ? -> test.less
    const importerFooLESS = res.get(mockPathFooLESS)
    expect([...importerFooLESS!.importer][0]).toBe(mockPathTestLESS)
    // foo.less -> test.css or test.less ? -> test.less -> test2.css
    const importerTestLESS = res.get(mockPathTestLESS)
    expect([...importerTestLESS!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.less -> test2.css
    const mockPathFoo2LESS = transformSymbol(`${resolve()}/core/runtime/__test__/style/foo2.less`)
    const mockPathTestCSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test.css`)
    const importerFoo2LESS = res.get(mockPathFoo2LESS)
    expect([...importerFoo2LESS!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.less ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('preProcessCSS: map path styl -> css or styl', () => {
    const res = preProcessCSS({ rootDir: resolve('packages') })
    const mockPathFooSTYL = transformSymbol(`${resolve()}/core/runtime/__test__/style/foo.styl`)
    const mockPathTestSTYL = transformSymbol(`${resolve()}/core/runtime/__test__/style/test.styl`)
    const mockPathTest2CSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test2.css`)
    // foo.styl -> test.css or test.styl ? -> test.styl
    const importerFooSTYL = res.get(mockPathFooSTYL)
    expect([...importerFooSTYL!.importer][0]).toBe(mockPathTestSTYL)
    // foo.styl -> test.css or test.styl ? -> test.styl -> test2.css
    const importerTestSTYL = res.get(mockPathTestSTYL)
    expect([...importerTestSTYL!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.styl -> test2.css
    const mockPathFoo2STYL = transformSymbol(`${resolve()}/core/runtime/__test__/style/foo2.styl`)
    const mockPathTestCSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test.css`)
    const importerFoo2STYL = res.get(mockPathFoo2STYL)
    expect([...importerFoo2STYL!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.styl ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('preProcessCSS: map path sass -> css or sass', () => {
    const res = preProcessCSS({ rootDir: resolve('packages') })
    const mockPathFooSASS = transformSymbol(`${resolve()}/core/runtime/__test__/style/foo.sass`)
    const mockPathTestSASS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test.sass`)
    const mockPathTest2CSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test2.css`)
    // foo.sass -> test.css or test.sass ? -> test.sass
    const importerFooSASS = res.get(mockPathFooSASS)
    expect([...importerFooSASS!.importer][0]).toBe(mockPathTestSASS)
    // foo.sass -> test.css or test.sass ? -> test.sass -> test2.css
    const importerTestSASS = res.get(mockPathTestSASS)
    expect([...importerTestSASS!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.sass -> test2.css
    const mockPathFoo2SASS = transformSymbol(`${resolve()}/core/runtime/__test__/style/foo2.sass`)
    const mockPathTestCSS = transformSymbol(`${resolve()}/core/runtime/__test__/style/test.css`)
    const importerFoo2SASS = res.get(mockPathFoo2SASS)
    expect([...importerFoo2SASS!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.sass ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('getContentNoImporter: basic', () => {
    const mockSassContent = '@import "./test";\n'
      + '@use \'./test-use\';\n'
      + '@require \'./test-require\';\n'
      + '#app {\n'
      + '  div {\n'
      + '    color: v-bind(fooColor);\n'
      + '  }\n'
      + '  .foo {\n'
      + '    color: red\n'
      + '  }\n'
      + '}'

    const mockStatement = [
      { type: 'import', path: '"./test"', start: 8, end: 16 },
      { type: 'use', path: '\'./test-use\'', start: 23, end: 35 },
      { type: 'require', path: '\'./test-require\'', start: 46, end: 62 },
    ]
    const res = getContentNoImporter(mockSassContent, mockStatement as ImportStatement[])
    expect(res.includes('import')).not.toBeTruthy()
    expect(res.includes('use')).not.toBeTruthy()
    expect(res.includes('require')).not.toBeTruthy()
    expect(res).toMatchSnapshot()
  })

  test('getContentNoImporter: no ; ', () => {
    const mockSassContent = '@import "./test"\n'
      + '@use \'./test-use\'\n'
      + '@require \'./test-require\'\n'
      + '#app {\n'
      + '  div {\n'
      + '    color: v-bind(fooColor);\n'
      + '  }\n'
      + '  .foo {\n'
      + '    color: red\n'
      + '  }\n'
      + '}'

    const mockStatement = [
      { type: 'import', path: '"./test"', start: 8, end: 16 },
      { type: 'use', path: '\'./test-use\'', start: 22, end: 35 },
      { type: 'require', path: '\'./test-require\'', start: 44, end: 60 },
    ]
    const res = getContentNoImporter(mockSassContent, mockStatement as ImportStatement[])
    expect(res.includes('@import')).not.toBeTruthy()
    expect(res.includes('@use')).not.toBeTruthy()
    expect(res.includes('@require')).not.toBeTruthy()
    expect(res).toMatchSnapshot()
  })

  test('getContentNoImporter: no start and end ', () => {
    const mockSassContent = '@import "./test"\n'
      + '@use \'./test-use\'\n'
      + '@require \'./test-require\'\n'
      + '#app {\n'
      + '  div {\n'
      + '    color: v-bind(fooColor);\n'
      + '  }\n'
      + '  .foo {\n'
      + '    color: red\n'
      + '  }\n'
      + '}'

    const mockStatement = [
      { type: 'import', path: '"./test"' },
      { type: 'use', path: '\'./test-use\'' },
      { type: 'require', path: '\'./test-require\'' },
    ]
    const res = getContentNoImporter(mockSassContent, mockStatement as ImportStatement[])
    expect(res).toMatchObject(mockSassContent)
    expect(res).toMatchSnapshot()
  })

  test('setImportToCompileRes: basic', () => {
    const mockSassContent = '#app {\n'
      + '  div {\n'
      + '    color: v-bind(fooColor);\n'
      + '  }\n'
      + '  .foo {\n'
      + '    color: red\n'
      + '  }\n'
      + '}'

    const mockStatement = [
      { type: 'import', path: '"./test"' },
      { type: 'use', path: '\'./test-use\'' },
    ]
    const res = setImportToCompileRes(mockSassContent, mockStatement as ImportStatement[])
    expect(res.includes('@import')).toBeTruthy()
    expect(res.includes('@use')).not.toBeTruthy()
    expect(res).toMatchSnapshot()
  })

  test('setImportToCompileRes: @import', () => {
    const mockSassContent = '#app {\n'
      + '  div {\n'
      + '    color: v-bind(fooColor);\n'
      + '  }\n'
      + '  .foo {\n'
      + '    color: red\n'
      + '  }\n'
      + '}'

    const mockStatement = [
      { type: 'import', path: '"./test"' },
    ]
    const res = setImportToCompileRes(mockSassContent, mockStatement as ImportStatement[])
    expect(res.includes('@import')).toBeTruthy()
    expect(res.includes('@use')).not.toBeTruthy()
    expect(res.includes('@require')).not.toBeTruthy()
    expect(res).toMatchSnapshot()
  })

  test('setImportToCompileRes: @use', () => {
    const mockSassContent = '#app {\n'
      + '  div {\n'
      + '    color: v-bind(fooColor);\n'
      + '  }\n'
      + '  .foo {\n'
      + '    color: red\n'
      + '  }\n'
      + '}'

    const mockStatement = [
      { type: 'use', path: '"./test"' },
    ]
    const res = setImportToCompileRes(mockSassContent, mockStatement as ImportStatement[])
    expect(res.includes('@import')).toBeTruthy()
    expect(res.includes('@use')).not.toBeTruthy()
    expect(res.includes('@require')).not.toBeTruthy()
    expect(res).toMatchSnapshot()
  })

  test('setImportToCompileRes: @require', () => {
    const mockSassContent = '#app {\n'
      + '  div {\n'
      + '    color: v-bind(fooColor);\n'
      + '  }\n'
      + '  .foo {\n'
      + '    color: red\n'
      + '  }\n'
      + '}'

    const mockStatement = [
      { type: 'require', path: '"./test"' },
    ]
    const res = setImportToCompileRes(mockSassContent, mockStatement as ImportStatement[])
    expect(res.includes('@import')).toBeTruthy()
    expect(res.includes('@use')).not.toBeTruthy()
    expect(res.includes('@require')).not.toBeTruthy()
    expect(res).toMatchSnapshot()
  })

  test('setImportToCompileRes: no @use and @import and @require', () => {
    const mockSassContent = '#app {\n'
      + '  div {\n'
      + '    color: v-bind(fooColor);\n'
      + '  }\n'
      + '  .foo {\n'
      + '    color: red\n'
      + '  }\n'
      + '}'

    const mockStatement = [
      { type: 'foo', path: '"./test"' },
      { type: 'foo', path: '"./test"' },
      { type: 'foo', path: '"./test"' },
    ]
    const res = setImportToCompileRes(mockSassContent, mockStatement as ImportStatement[])
    expect(res.includes('@import')).not.toBeTruthy()
    expect(res.includes('@use')).not.toBeTruthy()
    expect(res.includes('@require')).not.toBeTruthy()
    expect(res).toMatchObject(mockSassContent)
    expect(res).toMatchSnapshot()
  })

  test('generateCSSCode: get css code', () => {
    const mockCSSRes = '.test {\n'
      + '  color: v-bind(appTheme2);\n'
      + '}'

    const res = generateCSSCode(mockCSSRes, '.css')
    expect(delTransformSymbol(res)).toBe(delTransformSymbol(mockCSSRes))
    expect(delTransformSymbol(res)).toMatchSnapshot()
  })

  test('generateCSSCode: get scss code', () => {
    const mockSassContent = '#app div {  color: v-bind(appTheme2);}'

    const mockCSSRes = '#app div {  color: v-bind(appTheme2);}'
    const res = generateCSSCode(mockSassContent, '.scss')

    expect(delTransformSymbol(res)).toBe(delTransformSymbol(mockCSSRes))
    expect(delTransformSymbol(res)).toMatchSnapshot()
  })

  test('generateCSSCode: get less code', () => {
    const mockLessContent = '#app {\n'
      + '  div {\n'
      + '    color: v-bind(appTheme2);\n'
      + '  }\n'
      + '}'

    const mockCSSRes = '#app div {  color: v-bind(appTheme2);}'
    const res = generateCSSCode(mockLessContent, '.less')

    expect(delTransformSymbol(res)).toBe(delTransformSymbol(mockCSSRes))
    expect(delTransformSymbol(res)).toMatchSnapshot()
  })

  test('generateCSSCode: get styl code', () => {
    const mockStylContent = '#app\n'
      + '  div\n'
      + '    color: v-bind(appTheme2);'

    const mockCSSRes = '#app div {  color: v-bind(appTheme2);}'
    const res = generateCSSCode(mockStylContent, '.styl')

    expect(delTransformSymbol(res)).toBe(delTransformSymbol(mockCSSRes))
    expect(delTransformSymbol(res)).toMatchSnapshot()
  })
})
