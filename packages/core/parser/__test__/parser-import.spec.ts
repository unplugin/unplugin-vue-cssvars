import { describe, expect, test } from 'vitest'
import { ParserState, parseImports } from '../parser-import'

describe('parse import', () => {
  test('parseImports: Initial -> At', () => {
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
  })
})
