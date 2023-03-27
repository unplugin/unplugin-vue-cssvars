import { describe, expect, test } from 'vitest'
import { ParserState, parseImports } from '../parser-import'
import { parseImportsNext } from '../parser-import-next'

describe('parse import', () => {
  /* test('parseImports: Initial -> At', () => {
    const { getCurState } = parseImports('@')
    expect(getCurState()).toBe(ParserState.At)
  })

  test('parseImports: At -> AtImport', () => {
    const { getCurState } = parseImports('@i')
    expect(getCurState()).toBe(ParserState.AtImport)
  })

  test('parseImports: At -> AtUse', () => {
    const { getCurState } = parseImports('@u')
    expect(getCurState()).toBe(ParserState.AtUse)
  })

  test('parseImports: At -> AtRequire', () => {
    const { getCurState } = parseImports('@r')
    expect(getCurState()).toBe(ParserState.AtRequire)
  })

  test('parseImports: At -> Initial', () => {
    const { getCurState } = parseImports('@a')
    expect(getCurState()).toBe(ParserState.Initial)
  })

  test('parseImports: AtUse -> Initial', () => {
    const { getCurState } = parseImports('@use;')
    expect(getCurState()).toBe(ParserState.Initial)
  })

  test('parseImports: AtImport -> Initial', () => {
    const { getCurState } = parseImports('@import;')
    expect(getCurState()).toBe(ParserState.Initial)
  })

  test('parseImports: AtRequire -> Initial', () => {
    const { getCurState } = parseImports('@require;')
    expect(getCurState()).toBe(ParserState.Initial)
  })

  test('parseImports: AtUse -> StringLiteral', () => {
    const { getCurState, getCurImport } = parseImports('@use "')
    expect(getCurState()).toBe(ParserState.StringLiteral)
    expect(getCurImport()).toMatchObject({ type: 'use', path: '"', start: 5 })

    const { getCurState: getCurState1, getCurImport: getCurImport1 } = parseImports('@use \'')
    expect(getCurState1()).toBe(ParserState.StringLiteral)
    expect(getCurImport1()).toMatchObject({ type: 'use', path: '\'', start: 5 })

    const { getCurState: getCurState2, getCurImport: getCurRequire1 } = parseImports('@require \'')
    expect(getCurState2()).toBe(ParserState.StringLiteral)
    expect(getCurRequire1()).toMatchObject({ type: 'require', path: '\'', start: 9 })
  })

  test('parseImports: StringLiteral -> concat string', () => {
    const { getCurState, getCurImport } = parseImports('@import "test')
    expect(getCurState()).toBe(ParserState.StringLiteral)
    expect(getCurImport()).toMatchObject({ type: 'import', path: '"test', start: 8 })

    const { getCurState: getCurState1, getCurImport: getCurImport1 } = parseImports('@use "test')
    expect(getCurState1()).toBe(ParserState.StringLiteral)
    expect(getCurImport1()).toMatchObject({ type: 'use', path: '"test', start: 5 })

    const { getCurState: getCurState2, getCurImport: getCurRequire1 } = parseImports('@require "test')
    expect(getCurState2()).toBe(ParserState.StringLiteral)
    expect(getCurRequire1()).toMatchObject({ type: 'require', path: '"test', start: 9 })
  })

  test('parseImports: AtImport -> end', () => {
    const {
      imports: imports1,
      getCurState: getCurState1,
      getCurImport: getCurImport1,
    } = parseImports('@use "test";')
    expect(getCurState1()).toBe(ParserState.Initial)
    expect(getCurImport1()).toBe(undefined)
    expect(imports1).toMatchObject([{ type: 'use', path: '"test"', start: 5, end: 11 }])

    const {
      imports: imports2,
      getCurState: getCurState2,
      getCurImport: getCurImport2,
    } = parseImports('@use "test"')
    expect(getCurState2()).toBe(ParserState.AtUse)
    expect(getCurImport2()).toMatchObject({ type: 'use', path: '"test"', start: 5 })
    expect(imports2.length).toBe(0)

    const {
      imports: imports4,
      getCurState: getCurState4,
      getCurImport: getCurImport4,
    } = parseImports('@import "test";')
    expect(getCurState4()).toBe(ParserState.Initial)
    expect(getCurImport4()).toBe(undefined)
    expect(imports4).toMatchObject([{ type: 'import', path: '"test"', start: 8, end: 14 }])

    const {
      imports: imports3,
      getCurState: getCurState3,
      getCurImport: getCurImport3,
    } = parseImports('@import "test"')
    expect(getCurState3()).toBe(ParserState.AtImport)
    expect(getCurImport3()).toMatchObject({ type: 'import', path: '"test"', start: 8 })
    expect(imports3.length).toBe(0)

    const {
      imports: imports5,
      getCurState: getCurState5,
      getCurImport: getCurImport5,
    } = parseImports('@require "test";')
    expect(getCurState5()).toBe(ParserState.Initial)
    expect(getCurImport5()).toBe(undefined)
    expect(imports5).toMatchObject([{ type: 'require', path: '"test"', start: 9, end: 15 }])

    const {
      imports: imports6,
      getCurState: getCurState6,
      getCurImport: getCurImport6,
    } = parseImports('@require "test"')
    expect(getCurState6()).toBe(ParserState.AtRequire)
    expect(getCurImport6()).toMatchObject({ type: 'require', path: '"test"', start: 9 })
    expect(imports6.length).toBe(0)
  })

  test('parseImports: basic', () => {
    const {
      imports,
      getCurState,
      getCurImport,
    } = parseImports('@import "./test";\n'
      + '@use \'./test-use\';\n'
      + '@require \'./test-require\';\n'
      + '#app {\n'
      + '  div {\n'
      + '    color: v-bind(fooColor);\n'
      + '  }\n'
      + '  .foo {\n'
      + '    color: red\n'
      + '  }\n'
      + '}')
    expect(getCurState()).toBe(ParserState.Initial)
    expect(getCurImport()).toBe(undefined)
    expect(imports).toMatchObject([
      { type: 'import', path: '"./test"', start: 8, end: 16 },
      { type: 'use', path: '\'./test-use\'', start: 23, end: 35 },
      { type: 'require', path: '\'./test-require\'', start: 46, end: 62 },
    ])
  }) */

  test('parseImports: TESSSSSST', () => {
     const test1 = '     @import     \'./test.css\';'
    expect(parseImportsNext(test1).imports).toMatchObject([{ type: 'import', path: './test.css' }])

    const test2 = '@import \'test\';\n@import \'test2\';\n'
    expect(parseImportsNext(test2).imports).toMatchObject([{ type: 'import', path: 'test' }, { type: 'import', path: 'test2' }])

    const test3 = '@import \\"test.css\\";'
    expect(parseImportsNext(test3).imports).toMatchObject([{ type: 'import', path: 'test.css' }])

    const test4 = '@import \\"test\\";\n'
    expect(parseImportsNext(test4).imports).toMatchObject([{ type: 'import', path: 'test' }])

    const test5 = '@import \'test.css\'\n'
    expect(parseImportsNext(test5).imports).toMatchObject([{ type: 'import', path: 'test.css' }])

    const test6 = '@import \'test\'\n'
    expect(parseImportsNext(test6).imports).toMatchObject([{ type: 'import', path: 'test' }])

    const test7 = '@import \\"test.css\\"'
    expect(parseImportsNext(test7).imports).toMatchObject([{ type: 'import', path: 'test.css' }])

    const test8 = '@import \\"test\\"'
    expect(parseImportsNext(test8).imports).toMatchObject([{ type: 'import', path: 'test' }])

    const test9 = '@importB' // 不解析
    expect(parseImportsNext(test9).imports).toMatchObject([])

    const test10 = '@use \'test.css\';'
    expect(parseImportsNext(test10).imports).toMatchObject([{ type: 'use', path: 'test.css' }])

    const test11 = '@use \'test\';'
    expect(parseImportsNext(test11).imports).toMatchObject([{ type: 'use', path: 'test' }])

    const test12 = '@use \\"./test.css\\";'
    expect(parseImportsNext(test12).imports).toMatchObject([{ type: 'use', path: './test.css' }])

    const test13 = '@use \\"./test\\";\n'
    expect(parseImportsNext(test13).imports).toMatchObject([{ type: 'use', path: './test' }])

    const test14 = '@use \'test.css\''
    expect(parseImportsNext(test14).imports).toMatchObject([{ type: 'use', path: 'test.css' }])

    const test15 = '@use \'test\''
    expect(parseImportsNext(test15).imports).toMatchObject([{ type: 'use', path: 'test' }])

    const test16 = '@use \\"./test.css\\"'
    expect(parseImportsNext(test16).imports).toMatchObject([{ type: 'use', path: './test.css' }])

    const test17 = '@use \\"test\\"'
    expect(parseImportsNext(test17).imports).toMatchObject([{ type: 'use', path: 'test' }])

    const test18 = '@usetest' // 不解析
    expect(parseImportsNext(test18).imports).toMatchObject([])

    const test19 = '@require \'test.css\';' // { type: 'import', path: '\'./test.css\''}
    expect(parseImportsNext(test19).imports).toMatchObject([{ type: 'require', path: 'test.css' }])

    const test20 = '@require \'test\';' // { type: 'import', path: '\'./test\''}
    expect(parseImportsNext(test20).imports).toMatchObject([{ type: 'require', path: 'test' }])

    const test21 = '@require \\"test.css\\";' // { type: 'import', path: '\\"./test.css\\"'}
    expect(parseImportsNext(test21).imports).toMatchObject([{ type: 'require', path: 'test.css' }])

    const test22 = '@require \\"test\\";' // { type: 'import', path: '\\"./test\\"'}
    expect(parseImportsNext(test22).imports).toMatchObject([{ type: 'require', path: 'test' }])

    const test23 = '@require \'test.css\'' // { type: 'import', path: '\'./test.css\''}
    expect(parseImportsNext(test23).imports).toMatchObject([{ type: 'require', path: 'test.css' }])

    const test24 = '@require \'test\'' // { type: 'import', path: '\'./test\''}
    expect(parseImportsNext(test24).imports).toMatchObject([{ type: 'require', path: 'test' }])

    const test25 = '@require \\"test.css\\"' // { type: 'import', path: '\\"./test.css\\"'}
    expect(parseImportsNext(test25).imports).toMatchObject([{ type: 'require', path: 'test.css' }])

    const test26 = '@require \\"test\\"' // { type: 'import', path: '\\"./test\\"'}
    expect(parseImportsNext(test26).imports).toMatchObject([{ type: 'require', path: 'test' }])

    const test27 = '@requiretest' // 不解析
    expect(parseImportsNext(test27).imports).toMatchObject([])

    const test28_1 = '@require test.css'
    expect(parseImportsNext(test28_1).imports).toMatchObject([{ type: 'require', path: 'test.css' }])

    const test28_2 = '@require ./test'
    expect(parseImportsNext(test28_2).imports).toMatchObject([{ type: 'require', path: './test' }])

    const test28_3 = '@require test;'
    expect(parseImportsNext(test28_3).imports).toMatchObject([{ type: 'require', path: 'test' }])

    const test28_4 = '@require ./test\n'
    expect(parseImportsNext(test28_4).imports).toMatchObject([{ type: 'require', path: './test' }])


    const test28_5 = '@require test.css@require test2.css'
    expect(parseImportsNext(test28_5).imports).toMatchObject([
      { type: 'require', path: 'test.css@require' },
      { type: 'require', path: 'test2.css' },
    ])

    const test28_6 = '@require test.css,@require test2.css'
    expect(parseImportsNext(test28_6).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'require', path: 'test2.css' },
    ])

    const test28_7 = '@require test.css;@require test2.css'
    expect(parseImportsNext(test28_7).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'require', path: 'test2.css' },
    ])

    const test28_9 = '@require test.css; @require test2.css'
    expect(parseImportsNext(test28_9).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'require', path: 'test2.css' },
    ])

    const test28_8 = '@require test.css, @require test2.css'
    expect(parseImportsNext(test28_8).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'require', path: 'test2.css' },
    ])

    const test28_10 = '@require test.css @require test2.css'
    expect(parseImportsNext(test28_10).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'require', path: 'test2.css' },
    ])

    const test28_11 = '@require test.css @use test2.css'
    expect(parseImportsNext(test28_11).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'use', path: 'test2.css' },
    ])

    const test28 = '@import   ./test1, ./test2'
    expect(parseImportsNext(test28).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])

    const test29 = '@import ./test1, ./test2;\n'
    expect(parseImportsNext(test29).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])
    const test30 = '@use ./test1,./test2'
    const res = parseImportsNext(test30).imports
    expect(res).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])
    const test31 = '@use ./test1,./test2;'
    expect(parseImportsNext(test31).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])
    const test32 = '@require ./test1,./test2'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImportsNext(test32).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])

    const test33 = '@require ./test1,./test2;'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImportsNext(test33).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])

    const test34 = '@import \\"./test1\\",\\"./test2\\"' // { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImportsNext(test34).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])

    const test35 = '@import \\"./test1\\",\\"./test2\\";'// { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImportsNext(test35).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])

    const test36 = '@use \\"./test1\\",\\"./test2\\"' // { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImportsNext(test36).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])

    const test37 = '@use \\"./test1\\",\\"./test2\\";'// { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImportsNext(test37).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])

    const test38 = '@require \\"./test1\\", \\"./test2\\"' // { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImportsNext(test38).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])

    const test39 = '@require \\"./test1\\", \\"./test2\\";'// { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImportsNext(test39).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])

    const test40 = '@import \'./test1\',\'./test2\'' // { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImportsNext(test40).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])

    const test41 = '@import \'./test1\',\'./test2\';'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImportsNext(test41).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])

    const test42 = '@use \'./test1\',\'./test2\'' // { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImportsNext(test42).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])

    const test43 = '@use \'./test1\',\'./test2\';'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImportsNext(test43).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])

    const test43_1 = '@use \'./test1\',\'./test2\';'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImportsNext(test43_1).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])

    const test44 = '@require \'./test1\', \'./test2\'' // { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImportsNext(test44).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])
    const test45 = '@require \'./test1\', \'./test2\';'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImportsNext(test45).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])

    const test46 = '@requiretest\\"' // '， " 报错
    expect(() => parseImportsNext(test46)).toThrowError('syntax error: unmatched quotes')
    const test49 = '@requiretest\'' // '， " 报错
    expect(() => parseImportsNext(test49)).toThrowError('syntax error: unmatched quotes')

    const test47 = 'e@require\\"st' // '， " 报错
    expect(() => parseImportsNext(test47)).toThrowError('syntax error')

    const test53 = '@requiretests @require test' // 解析
    expect(() => parseImportsNext(test53)).toThrowError('syntax error: unknown At Rule')

    const test48 = '@requ\\"iretest' // '， " 报错
    expect(() => parseImportsNext(test48)).toThrowError('syntax error')

    const test50 = 'e@requireete\'st' // '， " 报错
    expect(() => parseImportsNext(test50)).toThrowError('syntax error')
    const test51 = '@requ\'iretest' // '， " 报错
    expect(() => parseImportsNext(test51)).toThrowError('syntax error')

    const test52 = '@require \'teasd' // '， " 报错
    expect(() => parseImportsNext(test52)).toThrowError('syntax error: unmatched quotes')

    const test52_1 = 'adwad @require testadwad' // 忽略@前内容
    expect(parseImportsNext(test52_1).imports).toMatchObject([{ type: 'require', path: 'testadwad' }])

    const test54 = '@require tea\'sd' // '， " 报错
    expect(() => { parseImportsNext(test54) }).toThrowError('syntax error: unmatched quotes')

    const test55 = '@require teasd\'' // '， " 报错
    expect(() => parseImportsNext(test55)).toThrowError('syntax error: unmatched quotes')

    const test56 = '@require \\"teasd' // '， " 报错
    expect(() => parseImportsNext(test56)).toThrowError('syntax error: unmatched quotes')

    const test57 = '@require tea\\"sd' // '， "
    expect(() => parseImportsNext(test57)).toThrowError('syntax error: unmatched quotes')

    const test58 = '@require teasd\\"' // '， " 报错 TODO
    expect(() => parseImportsNext(test58)).toThrowError('syntax error: unmatched quotes')

    const test59 = '@at-root teasd;@require teasd' // 报错
    expect(parseImportsNext(test59).imports).toMatchObject([
      { type: 'require', path: 'teasd' }
    ])
    // TODO：引号 和 无引号混合
    // TODO：注释
  })
})
