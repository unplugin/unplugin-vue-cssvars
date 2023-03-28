import { resolve } from 'path'
import { describe, expect, test, vi } from 'vitest'
import * as csstree from 'css-tree'
import { transformSymbol } from '@unplugin-vue-cssvars/utils'
import {
  generateCSSCode,
  getCSSImport,
  getCSSVarsCode,
  getCurFileContent,
  preProcessCSS,
  setImportToCompileRes,
  walkCSSTree,
} from '../pre-process-css'
import type { ImportStatement } from '../../parser/parser-import'
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
  test('getCSSImport: isAtrule', () => {
    const mockNode = {
      type: 'Atrule',
      name: 'import',
      value: 'foo',
    }
    const res = getCSSImport(mockNode as any, false, false)
    expect(res).toMatchObject({
      value: '',
      isAtrule: true,
      isAtrulePrelude: false,
    })
  })

  test('getCSSImport: AtrulePrelude & isAtrule is true', () => {
    const mockNode = {
      type: 'AtrulePrelude',
      name: 'import',
      value: 'foo',
    }
    const res = getCSSImport(mockNode as any, true, false)
    expect(res).toMatchObject({
      value: '',
      isAtrule: true,
      isAtrulePrelude: true,
    })
  })

  test('getCSSImport: AtrulePrelude & isAtrule is false', () => {
    const mockNode = {
      type: 'AtrulePrelude',
      name: 'import',
      value: 'foo',
    }
    const res = getCSSImport(mockNode as any, false, false)
    expect(res).toMatchObject({
      value: '',
      isAtrule: false,
      isAtrulePrelude: false,
    })
  })

  test('getCSSImport: string & isAtrule & isAtrule', () => {
    const mockNode = {
      type: 'String',
      name: 'import',
      value: 'foo',
    }
    const res = getCSSImport(mockNode as any, true, true)
    expect(res).toMatchObject({
      value: 'foo',
      isAtrule: false,
      isAtrulePrelude: false,
    })

    const res2 = getCSSImport(mockNode as any, false, false)
    expect(res2).toMatchObject({
      value: '',
      isAtrule: false,
      isAtrulePrelude: false,
    })

    const res3 = getCSSImport(mockNode as any, false, true)
    expect(res3).toMatchObject({
      value: '',
      isAtrule: false,
      isAtrulePrelude: true,
    })

    const res4 = getCSSImport(mockNode as any, true, false)
    expect(res4).toMatchObject({
      value: '',
      isAtrule: true,
      isAtrulePrelude: false,
    })
  })

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
      importer: string,
      vBindCode: Record<string, Set<string>> | null) => {
      mockEvt()
      res = {
        importer,
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
      importer: string,
      vBindCode: Record<string, Set<string>> | null) => {
      mockEvt()
      res = {
        importer,
        vBindCode,
      }
    }
    const ast = csstree.parse(mockCSSContent)
    walkCSSTree(ast, mockCallback, { i: false, v: true })
    expect(mockEvt).toBeCalledTimes(1)
    expect(res).toMatchSnapshot()
  })

  test('walkCSSTree: helper v is false', () => {
    let res
    const mockEvt = vi.fn()
    const mockCallback = (
      importer: string,
      vBindCode: Record<string, Set<string>> | null) => {
      mockEvt()
      res = {
        importer,
        vBindCode,
      }
    }
    const ast = csstree.parse(mockCSSContent)
    walkCSSTree(ast, mockCallback, { i: true, v: false })
    expect(mockEvt).toBeCalledTimes(1)
    expect(res).toMatchObject({
      importer: './test',
      vBindCode: null,
    })
  })

  test('walkCSSTree: helper v & i are false', () => {
    let res
    const mockEvt = vi.fn()
    const mockCallback = (
      importer: string,
      vBindCode: Record<string, Set<string>> | null) => {
      mockEvt()
      res = {
        importer,
        vBindCode,
      }
    }
    const ast = csstree.parse(mockCSSContent)
    walkCSSTree(ast, mockCallback, { i: false, v: false })
    expect(mockEvt).toBeCalledTimes(1)
    expect(res).toMatchObject({
      importer: '',
      vBindCode: null,
    })
  })

  test('preProcessCSS: basic', () => {
    const res = preProcessCSS({ rootDir: resolve('packages') })
    const mockPathTest1 = transformSymbol(`${resolve()}/core/css/__test__/test.css`)
    const mockPathTest2 = transformSymbol(`${resolve()}/core/css/__test__/test2.css`)
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
    const mockPathFooSCSS = transformSymbol(`${resolve()}/core/css/__test__/foo.scss`)
    const mockPathTestSCSS = transformSymbol(`${resolve()}/core/css/__test__/test.scss`)
    const mockPathTest2CSS = transformSymbol(`${resolve()}/core/css/__test__/test2.css`)
    // foo.scss -> test.css or test.scss ? -> test.scss
    const importerFooSCSS = res.get(mockPathFooSCSS)
    expect([...importerFooSCSS!.importer][0]).toBe(mockPathTestSCSS)
    // foo.scss -> test.css or test.scss ? -> test.scss -> test2.css
    const importerTestSCSS = res.get(mockPathTestSCSS)
    expect([...importerTestSCSS!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.scss -> test2.css
    const mockPathFoo2SCSS = transformSymbol(`${resolve()}/core/css/__test__/foo2.scss`)
    const mockPathTestCSS = transformSymbol(`${resolve()}/core/css/__test__/test.css`)
    const importerFoo2SCSS = res.get(mockPathFoo2SCSS)
    expect([...importerFoo2SCSS!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.scss ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('preProcessCSS: map path less -> css or less', () => {
    const res = preProcessCSS({ rootDir: resolve('packages') })
    const mockPathFooLESS = transformSymbol(`${resolve()}/core/css/__test__/foo.less`)
    const mockPathTestLESS = transformSymbol(`${resolve()}/core/css/__test__/test.less`)
    const mockPathTest2CSS = transformSymbol(`${resolve()}/core/css/__test__/test2.css`)
    // foo.less -> test.css or test.less ? -> test.less
    const importerFooLESS = res.get(mockPathFooLESS)
    expect([...importerFooLESS!.importer][0]).toBe(mockPathTestLESS)
    // foo.less -> test.css or test.less ? -> test.less -> test2.css
    const importerTestLESS = res.get(mockPathTestLESS)
    expect([...importerTestLESS!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.less -> test2.css
    const mockPathFoo2LESS = transformSymbol(`${resolve()}/core/css/__test__/foo2.less`)
    const mockPathTestCSS = transformSymbol(`${resolve()}/core/css/__test__/test.css`)
    const importerFoo2LESS = res.get(mockPathFoo2LESS)
    expect([...importerFoo2LESS!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.less ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('preProcessCSS: map path styl -> css or styl', () => {
    const res = preProcessCSS({ rootDir: resolve('packages') })
    const mockPathFooSTYL = transformSymbol(`${resolve()}/core/css/__test__/foo.styl`)
    const mockPathTestSTYL = transformSymbol(`${resolve()}/core/css/__test__/test.styl`)
    const mockPathTest2CSS = transformSymbol(`${resolve()}/core/css/__test__/test2.css`)
    // foo.styl -> test.css or test.styl ? -> test.styl
    const importerFooSTYL = res.get(mockPathFooSTYL)
    expect([...importerFooSTYL!.importer][0]).toBe(mockPathTestSTYL)
    // foo.styl -> test.css or test.styl ? -> test.styl -> test2.css
    const importerTestSTYL = res.get(mockPathTestSTYL)
    expect([...importerTestSTYL!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.styl -> test2.css
    const mockPathFoo2STYL = transformSymbol(`${resolve()}/core/css/__test__/foo2.styl`)
    const mockPathTestCSS = transformSymbol(`${resolve()}/core/css/__test__/test.css`)
    const importerFoo2STYL = res.get(mockPathFoo2STYL)
    expect([...importerFoo2STYL!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.styl ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('getCurFileContent: basic', () => {
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
    const res = getCurFileContent(mockSassContent, mockStatement as ImportStatement[])
    expect(res.includes('import')).not.toBeTruthy()
    expect(res.includes('use')).not.toBeTruthy()
    expect(res.includes('require')).not.toBeTruthy()
    expect(res).toMatchSnapshot()
  })

  test('getCurFileContent: no ; ', () => {
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
    const res = getCurFileContent(mockSassContent, mockStatement as ImportStatement[])
    expect(res.includes('@import')).not.toBeTruthy()
    expect(res.includes('@use')).not.toBeTruthy()
    expect(res.includes('@require')).not.toBeTruthy()
    expect(res).toMatchSnapshot()
  })

  test('getCurFileContent: no start and end ', () => {
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
    const res = getCurFileContent(mockSassContent, mockStatement as ImportStatement[])
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
    const mockCSSContent = '@import "./test";\n'
      + '.test {\n'
      + '    color: v-bind(appTheme2);\n'
      + '}'
    const mockPath = `${resolve('packages')}/core/css/__test__/test2.css`
    const res = generateCSSCode(mockPath, '.css')
    expect(delTransformSymbol(res)).toBe(delTransformSymbol(mockCSSContent))
    expect(delTransformSymbol(res)).toMatchSnapshot()
  })

  test('generateCSSCode: get scss code', () => {
    const mockSassContent = '@import "./test";\n'
      + '#app div {\n'
      + '  color: v-bind(fooColor);\n'
      + '}'
    const mockPath = `${resolve('packages')}/core/css/__test__/foo.scss`
    const res = generateCSSCode(mockPath, '.scss')

    expect(delTransformSymbol(res)).toBe(delTransformSymbol(mockSassContent))
    expect(delTransformSymbol(res)).toMatchSnapshot()
  })

  test('generateCSSCode: get less code', () => {
    const mockLessContent = '@import "./test";\n'
      + '#app div {\n'
      + '  color: v-bind(fooColor);\n'
      + '}'
      + '\n'
    const mockPath = `${resolve('packages')}/core/css/__test__/foo.less`
    const res = generateCSSCode(mockPath, '.less')
    expect(delTransformSymbol(res)).toBe(delTransformSymbol(mockLessContent))
    expect(delTransformSymbol(res)).toMatchSnapshot()
  })

  test('generateCSSCode: get styl code', () => {
    const mockStylContent = '@import "./test";\n'
      + '#app div {\n'
      + '  color: v-bind(stylColor);\n'
      + '}'
      + '\n'
    const mockPath = `${resolve('packages')}/core/css/__test__/foo.styl`
    const res = generateCSSCode(mockPath, '.styl')
    expect(delTransformSymbol(res)).toBe(delTransformSymbol(mockStylContent))
    expect(delTransformSymbol(res)).toMatchSnapshot()
  })
})
