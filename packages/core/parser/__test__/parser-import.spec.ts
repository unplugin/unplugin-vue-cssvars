import { describe, expect, test } from 'vitest'
import { ParserState, parseImports } from '../parser-import-next'

describe('parse import', () => {
  test('parseImports: basic', () => {
    const input = '@import "./test";\n'
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
    const {
      imports,
      getCurState,
      getCurImport,
    } = parseImports(input)

    expect(getCurState()).toBe(ParserState.Initial)
    expect(getCurImport()).toBe(undefined)
    expect(imports).toMatchObject([
      { type: 'import', path: './test', start: 8, end: 16 },
      { type: 'use', path: './test-use', start: 23, end: 35 },
      { type: 'require', path: './test-require', start: 46, end: 62 },
    ])
  })

  test('parseImports: test1', () => {
    const test1 = '     @import     \'./test.css\';'
    expect(parseImports(test1).imports).toMatchObject([{ type: 'import', path: './test.css' }])
  })
  test('parseImports: test2', () => {
    const test2 = '@import \'test\';\n@import \'test2\';\n'
    expect(parseImports(test2).imports).toMatchObject([{ type: 'import', path: 'test' }, { type: 'import', path: 'test2' }])
  })
  test('parseImports: test3', () => {
    const test3 = '@import \\"test.css\\";'
    expect(parseImports(test3).imports).toMatchObject([{ type: 'import', path: 'test.css' }])
  })
  test('parseImports: test4', () => {
    const test4 = '@import \\"test\\";\n'
    expect(parseImports(test4).imports).toMatchObject([{ type: 'import', path: 'test' }])
  })

  test('parseImports: test5', () => {
    const test5 = '@import \'test.css\'\n'
    expect(parseImports(test5).imports).toMatchObject([{ type: 'import', path: 'test.css' }])
  })

  test('parseImports: test6', () => {
    const test6 = '@import \'test\'\n'
    expect(parseImports(test6).imports).toMatchObject([{ type: 'import', path: 'test' }])
  })

  test('parseImports: test7', () => {
    const test7 = '@import \\"test.css\\"'
    expect(parseImports(test7).imports).toMatchObject([{ type: 'import', path: 'test.css' }])
  })

  test('parseImports: test8', () => {
    const test8 = '@import \\"test\\"'
    expect(parseImports(test8).imports).toMatchObject([{ type: 'import', path: 'test' }])
  })

  test('parseImports: test9', () => {
    const test9 = '@importB' // 不解析
    expect(parseImports(test9).imports).toMatchObject([])
  })

  test('parseImports: test10', () => {
    const test10 = '@use \'test.css\';'
    expect(parseImports(test10).imports).toMatchObject([{ type: 'use', path: 'test.css' }])
  })
  test('parseImports: test11', () => {
    const test11 = '@use \'test\';'
    expect(parseImports(test11).imports).toMatchObject([{ type: 'use', path: 'test' }])
  })
  test('parseImports: test12', () => {
    const test12 = '@use \\"./test.css\\";'
    expect(parseImports(test12).imports).toMatchObject([{ type: 'use', path: './test.css' }])
  })
  test('parseImports: test13', () => {
    const test13 = '@use \\"./test\\";\n'
    expect(parseImports(test13).imports).toMatchObject([{ type: 'use', path: './test' }])
  })
  test('parseImports: test14', () => {
    const test14 = '@use \'test.css\''
    expect(parseImports(test14).imports).toMatchObject([{ type: 'use', path: 'test.css' }])
  })
  test('parseImports: test15', () => {
    const test15 = '@use \'test\''
    expect(parseImports(test15).imports).toMatchObject([{ type: 'use', path: 'test' }])
  })
  test('parseImports: test16', () => {
    const test16 = '@use \\"./test.css\\"'
    expect(parseImports(test16).imports).toMatchObject([{ type: 'use', path: './test.css' }])
  })
  test('parseImports: test17', () => {
    const test17 = '@use \\"test\\"'
    expect(parseImports(test17).imports).toMatchObject([{ type: 'use', path: 'test' }])
  })
  test('parseImports: test18', () => {
    const test18 = '@usetest' // 不解析
    expect(parseImports(test18).imports).toMatchObject([])
  })
  test('parseImports: test19', () => {
    const test19 = '@require \'test.css\';' // { type: 'import', path: '\'./test.css\''}
    expect(parseImports(test19).imports).toMatchObject([{ type: 'require', path: 'test.css' }])
  })
  test('parseImports: test20', () => {
    const test20 = '@require \'test\';' // { type: 'import', path: '\'./test\''}
    expect(parseImports(test20).imports).toMatchObject([{ type: 'require', path: 'test' }])
  })
  test('parseImports: test21', () => {
    const test21 = '@require \\"test.css\\";' // { type: 'import', path: '\\"./test.css\\"'}
    expect(parseImports(test21).imports).toMatchObject([{ type: 'require', path: 'test.css' }])
  })
  test('parseImports: test22', () => {
    const test22 = '@require \\"test\\";'
    expect(parseImports(test22).imports).toMatchObject([{ type: 'require', path: 'test' }])
  })
  test('parseImports: test23', () => {
    const test23 = '@require \'test.css\''
    expect(parseImports(test23).imports).toMatchObject([{ type: 'require', path: 'test.css' }])
  })
  test('parseImports: test24', () => {
    const test24 = '@require \'test\''
    expect(parseImports(test24).imports).toMatchObject([{ type: 'require', path: 'test' }])
  })
  test('parseImports: test25', () => {
    const test25 = '@require \\"test.css\\"'
    expect(parseImports(test25).imports).toMatchObject([{ type: 'require', path: 'test.css' }])
  })
  test('parseImports: test26', () => {
    const test26 = '@require \\"test\\"'
    expect(parseImports(test26).imports).toMatchObject([{ type: 'require', path: 'test' }])
  })
  test('parseImports: test27', () => {
    const test27 = '@requiretest'
    expect(parseImports(test27).imports).toMatchObject([])
  })
  test('parseImports: test28', () => {
    const test28 = '@require test.css'
    expect(parseImports(test28).imports).toMatchObject([{ type: 'require', path: 'test.css' }])
  })
  test('parseImports: test29', () => {
    const test29 = '@require ./test'
    expect(parseImports(test29).imports).toMatchObject([{ type: 'require', path: './test' }])
  })
  test('parseImports: test30', () => {
    const test30 = '@require test;'
    expect(parseImports(test30).imports).toMatchObject([{ type: 'require', path: 'test' }])
  })
  test('parseImports: test31', () => {
    const test31 = '@require ./test\n'
    expect(parseImports(test31).imports).toMatchObject([{ type: 'require', path: './test' }])
  })
  test('parseImports: test32', () => {
    const test32 = '@require test.css@require test2.css'
    expect(parseImports(test32).imports).toMatchObject([
      { type: 'require', path: 'test.css@require' },
      { type: 'require', path: 'test2.css' },
    ])
  })
  test('parseImports: test33', () => {
    const test33 = '@require test.css,@require test2.css'
    expect(parseImports(test33).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'require', path: 'test2.css' },
    ])
  })
  test('parseImports: test34', () => {
    const test34 = '@require test.css;@require test2.css'
    expect(parseImports(test34).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'require', path: 'test2.css' },
    ])
  })
  test('parseImports: test35', () => {
    const test35 = '@require test.css; @require test2.css'
    expect(parseImports(test35).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'require', path: 'test2.css' },
    ])
  })
  test('parseImports: test36', () => {
    const test36 = '@require test.css, @require test2.css'
    expect(parseImports(test36).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'require', path: 'test2.css' },
    ])
  })
  test('parseImports: test37', () => {
    const test37 = '@require test.css @require test2.css'
    expect(parseImports(test37).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'require', path: 'test2.css' },
    ])
  })
  test('parseImports: test38', () => {
    const test38 = '@require test.css @use test2.css'
    expect(parseImports(test38).imports).toMatchObject([
      { type: 'require', path: 'test.css' },
      { type: 'use', path: 'test2.css' },
    ])
  })
  test('parseImports: test39', () => {
    const test39 = '@import   ./test1, ./test2'
    expect(parseImports(test39).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])
  })
  test('parseImports: test40', () => {
    const test40 = '@import ./test1, ./test2;\n'
    expect(parseImports(test40).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])
  })
  test('parseImports: test41', () => {
    const test41 = '@use ./test1,./test2'
    const res = parseImports(test41).imports
    expect(res).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])
  })
  test('parseImports: test42', () => {
    const test42 = '@use ./test1,./test2;'
    expect(parseImports(test42).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])
  })
  test('parseImports: test43', () => {
    const test43 = '@require ./test1,./test2'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImports(test43).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])
  })
  test('parseImports: test44', () => {
    const test44 = '@require ./test1,./test2;'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImports(test44).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])
  })
  test('parseImports: test45', () => {
    const test45 = '@import \\"./test1\\",\\"./test2\\"' // { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImports(test45).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])
  })
  test('parseImports: test46', () => {
    const test46 = '@import \\"./test1\\",\\"./test2\\";'// { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImports(test46).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])
  })
  test('parseImports: test47', () => {
    const test47 = '@use \\"./test1\\",\\"./test2\\"' // { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImports(test47).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])
  })
  test('parseImports: test48', () => {
    const test48 = '@use \\"./test1\\",\\"./test2\\";'// { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImports(test48).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])
  })
  test('parseImports: test49', () => {
    const test49 = '@require \\"./test1\\", \\"./test2\\"' // { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImports(test49).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])
  })
  test('parseImports: test50', () => {
    const test50 = '@require \\"./test1\\", \\"./test2\\";'// { type: 'import', path: '\\"./test\\"'}, { type: 'import', path: '\\"./test2\\"'}
    expect(parseImports(test50).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])
  })
  test('parseImports: test51', () => {
    const test51 = '@import \'./test1\',\'./test2\'' // { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImports(test51).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])
  })
  test('parseImports: test52', () => {
    const test52 = '@import \'./test1\',\'./test2\';'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImports(test52).imports).toMatchObject([
      { type: 'import', path: './test1' },
      { type: 'import', path: './test2' },
    ])
  })
  test('parseImports: test53', () => {
    const test53 = '@use \'./test1\',\'./test2\'' // { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImports(test53).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])
  })
  test('parseImports: test54', () => {
    const test54 = '@use \'./test1\',\'./test2\';'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImports(test54).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])
  })
  test('parseImports: test55', () => {
    const test55 = '@use \'./test1\',\'./test2\';'// { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImports(test55).imports).toMatchObject([
      { type: 'use', path: './test1' },
      { type: 'use', path: './test2' },
    ])
  })
  test('parseImports: test56', () => {
    const test56 = '@require \'./test1\', \'./test2\'' // { type: 'import', path: '\'./test\''}, { type: 'import', path: '\'./test2\''}
    expect(parseImports(test56).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])
  })
  test('parseImports: test57', () => {
    const test57 = '@require \'./test1\', \'./test2\';'
    expect(parseImports(test57).imports).toMatchObject([
      { type: 'require', path: './test1' },
      { type: 'require', path: './test2' },
    ])
  })
  test('parseImports: test58', () => {
    const test58_1 = '@requiretest\\"'
    expect(() => parseImports(test58_1)).toThrowError('syntax error: unmatched quotes')
    const test58_2 = '@requiretest\''
    expect(() => parseImports(test58_2)).toThrowError('syntax error: unmatched quotes')

    const test58_3 = 'e@require\\"st'
    expect(() => parseImports(test58_3)).toThrowError('syntax error')

    const test58_4 = '@requiretests @require test'
    expect(() => parseImports(test58_4)).toThrowError('syntax error: unknown At Rule')

    const test58_5 = '@requ\\"iretest'
    expect(() => parseImports(test58_5)).toThrowError('syntax error')

    const test58_6 = 'e@requireete\'st'
    expect(() => parseImports(test58_6)).toThrowError('syntax error')

    const test58_7 = '@requ\'iretest'
    expect(() => parseImports(test58_7)).toThrowError('syntax error')

    const test58_8 = '@require \'teasd'
    expect(() => parseImports(test58_8)).toThrowError('syntax error: unmatched quotes')

    const test58_9 = 'adwad @require testadwad'
    expect(parseImports(test58_9).imports).toMatchObject([{ type: 'require', path: 'testadwad' }])

    const test58_10 = '@require tea\'sd'
    expect(() => { parseImports(test58_10) }).toThrowError('syntax error: unmatched quotes')

    const test58_11 = '@require teasd\''
    expect(() => parseImports(test58_11)).toThrowError('syntax error: unmatched quotes')

    const test58_12 = '@require \\"teasd'
    expect(() => parseImports(test58_12)).toThrowError('syntax error: unmatched quotes')

    const test58_13 = '@require tea\\"sd'
    expect(() => parseImports(test58_13)).toThrowError('syntax error: unmatched quotes')

    const test58_14 = '@require teasd\\"'
    expect(() => parseImports(test58_14)).toThrowError('syntax error: unmatched quotes')

    const test58_15 = '@at-root teasd;@require foo'
    expect(parseImports(test58_15).imports).toMatchObject([
      { type: 'require', path: 'foo' },
    ])
  })
  test('parseImports: test59', () => {
    const test59 = '@require tea;"sd"'
    expect(parseImports(test59).imports).toMatchObject([
      { type: 'require', path: 'tea' },
    ])
  })
  test('parseImports: test60', () => {
    const test60 = '@require "tea";sd'
    expect(parseImports(test60).imports).toMatchObject([
      { type: 'require', path: 'tea' },
    ])
  })
  test('parseImports: test61', () => {
    const test61 = '@require "tea",sd'
    expect(parseImports(test61).imports).toMatchObject([
      { type: 'require', path: 'tea' },
      { type: 'require', path: 'sd' },
    ])
  })
  test('parseImports: test62', () => {
    const test62 = '@require tea,"sd"'
    expect(parseImports(test62).imports).toMatchObject([
      { type: 'require', path: 'tea' },
      { type: 'require', path: 'sd' },
    ])
  })
  test('parseImports: test63', () => {
    const test63 = '@require tea "sd"'
    expect(parseImports(test63).imports).toMatchObject([
      { type: 'require', path: 'tea' },
      { type: 'require', path: 'sd' },
    ])
  })
  test('parseImports: test64', () => {
    const test64 = '@require "sd" tea'
    expect(parseImports(test64).imports).toMatchObject([
      { type: 'require', path: 'sd' },
      { type: 'require', path: 'tea' },
    ])
  })
  test('parseImports: test65', () => {
    const test65 = '@require \'sd\',tea'
    expect(parseImports(test65).imports).toMatchObject([
      { type: 'require', path: 'sd' },
      { type: 'require', path: 'tea' },
    ])
  })
  test('parseImports: test66', () => {
    const test66 = '@require sd,\'tea\''
    expect(parseImports(test66).imports).toMatchObject([
      { type: 'require', path: 'sd' },
      { type: 'require', path: 'tea' },
    ])
  })

  test('parseImports: test67', () => {
    const test67 = '@require sd;\'tea\''
    expect(parseImports(test67).imports).toMatchObject([
      { type: 'require', path: 'sd' },
    ])
  })

  test('parseImports: test68', () => {
    const test68 = '@require \'tea\';sd'
    expect(parseImports(test68).imports).toMatchObject([
      { type: 'require', path: 'tea' },
    ])
  })

  test('parseImports: test69', () => {
    const test69 = '// @require \'tea\';sd' // 无输出
    expect(parseImports(test69).imports).toMatchObject([])
  })

  test('parseImports: test70', () => {
    const test70 = '// @require \'tea\';sd\n@require \'redtea\';suda'
    expect(parseImports(test70).imports).toMatchObject([
      { type: 'require', path: 'redtea' },
    ])
  })

  test('parseImports: test71', () => {
    expect(() => parseImports('@require // \'tea\';sd'))
      .toThrowError('syntax error')
  })

  test('parseImports: test72', () => {
    const test72 = '@require \'tea\';sd\n//@require \'tea\';sd'

    expect(parseImports(test72).imports).toMatchObject([
      { type: 'require', path: 'tea' },
    ])
  })

  test('parseImports: test73', () => {
    const test73 = '/*@require \'tea\';sd\n*/@require \'tea\';sd'

    expect(parseImports(test73).imports).toMatchObject([
      { type: 'require', path: 'tea' },
    ])
  })

  test('parseImports: test74', () => {
    const test74 = '@require \'tea\';sd\n/*@require  */'
    expect(parseImports(test74).imports).toMatchObject([
      { type: 'require', path: 'tea' },
    ])
  })

  test('parseImports: test75', () => {
    const test75 = '/*@require \'tea\';sd\n//@require */\'tea\';sd'
    expect(parseImports(test75).imports).toMatchObject([])
  })

  test('parseImports: test76', () => {
    expect(() => parseImports('@require /* \'tea\';sd'))
      .toThrowError('syntax error')
  })
})
