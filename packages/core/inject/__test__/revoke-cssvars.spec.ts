import { resolve } from 'path'
import { cwd } from 'node:process'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { pathExists, readFile, remove } from 'fs-extra'
import MagicString from 'magic-string'
import {
  deleteInjectCSS,
  findInjects,
  removeInjectImporter,
  revokeCSSVars,
} from '../revoke-cssvars'
describe('revoke css', () => {
  let mockText = ''
  const testFileDir = `${cwd()}/mock.css`
  const testFileDir2 = `${cwd()}/mock2.css`
  const deleteRes = '\n'
    + '    some text\n'
    + '    \n'
    + '    some more text\n'
    + '    \n'
    + '    final text\n'
    + '  '

  const mockOption = {
    dir: resolve(),
  }
  let mockBundle = {
    'mock.css': {
      fileName: 'mock.css',
      source: mockText,
      type: 'asset',
    },
  }

  beforeEach(async() => {
    mockText = `
    some text
    /* <inject start> */
    inject me
    /* <inject end> */
    some more text
    /* <inject start> */
    inject me too
    /* <inject end> */
    final text
  `
    mockBundle = {
      'mock.css': {
        fileName: 'mock.css',
        source: mockText,
        type: 'asset',
      },
    }
  })

  afterEach(async() => {
    const isShouldClear = await pathExists(testFileDir)
    if (isShouldClear)
      await remove(testFileDir)
    const isShouldClear2 = await pathExists(testFileDir2)
    if (isShouldClear2)
      await remove(testFileDir2)
  })
  test('findInjects', () => {
    const expected = [
      { start: 19, end: 76, content: 'inject me' },
      { start: 100, end: 161, content: 'inject me too' },
    ]
    expect(findInjects(mockText)).toMatchObject(expected)
  })

  test('findInjects: no inject', () => {
    expect(findInjects('mockText')).toMatchObject([])
  })

  test('should return an array of objects with start, end, and content properties', () => {
    const input = '/*<inject start>*/\nconst foo = "bar";\n/*<inject end>*/\n'
    const result = findInjects(input)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
    expect(typeof result[0]).toBe('object')
    expect(result[0]).toHaveProperty('start')
    expect(result[0]).toHaveProperty('end')
    expect(result[0]).toHaveProperty('content')
  })

  test('should correctly extract content between <inject start> and <inject end> comments', () => {
    const input = '/*<inject start>*/\nconst foo = "bar";\n/*<inject end>*/\n'
    const result = findInjects(input)
    expect(result[0].content).toBe('const foo = "bar";')
  })

  test('should handle multiple <inject> blocks in the same string', () => {
    const input = '/*<inject start>*/\nconst foo = "bar";\n/*<inject end>*/\n/*<inject start>*/\nconst baz = "qux";\n/*<inject end>*/\n'
    const result = findInjects(input)
    expect(result.length).toBe(2)
    expect(result[0].content).toBe('const foo = "bar";')
    expect(result[1].content).toBe('const baz = "qux";')
  })

  test('should handle empty content between <inject start> and <inject end> comments', () => {
    const input = '/*<inject start>*/\n/*<inject end>*/\n'
    const result = findInjects(input)
    expect(result[0].content).toBe('')
  })

  test('deleteInjectCSS', () => {
    const mgcString = new MagicString(mockText)
    const injectContents = findInjects(mockText)
    const res = deleteInjectCSS(injectContents, mgcString)
    expect(res).toBe(deleteRes)
  })

  test('deleteInjectCSS: no inject', () => {
    const mgcString = new MagicString('mockText')
    const injectContents = findInjects('mockText')
    const res = deleteInjectCSS(injectContents, mgcString)
    expect(res).toBe('mockText')
  })

  test('revokeCSSVars: revoke content and save file', async() => {
    await revokeCSSVars(mockOption, mockBundle as any)
    const isCreated = await pathExists(testFileDir)
    expect(isCreated).toBeTruthy()

    const bufferRes = await readFile(testFileDir)
    expect(bufferRes.toString()).toBe(deleteRes)
  })

  test('revokeCSSVars: not asset type', async() => {
    mockBundle['mock.css'].type = 'chunk'

    await revokeCSSVars(mockOption, mockBundle as any)
    const isCreated = await pathExists(testFileDir)
    expect(isCreated).not.toBeTruthy()
  })

  test('revokeCSSVars: no inject', async() => {
    mockBundle['mock.css'].source = 'mockText'

    await revokeCSSVars(mockOption, mockBundle as any)
    const isCreated = await pathExists(testFileDir)
    expect(isCreated).toBeTruthy()

    const bufferRes = await readFile(testFileDir)
    expect(bufferRes.toString()).toBe('mockText')
  })

  test('revokeCSSVars: multiple bundle ', async() => {
    const bundle = {
      ...mockBundle,
      'mock2.css': {
        fileName: 'mock2.css',
        source: mockText,
        type: 'asset',
      },
    }

    await revokeCSSVars(mockOption, bundle as any)
    const isCreated1 = await pathExists(testFileDir)
    expect(isCreated1).toBeTruthy()

    const isCreated2 = await pathExists(testFileDir)
    expect(isCreated2).toBeTruthy()

    const bufferRes1 = await readFile(testFileDir2)
    expect(bufferRes1.toString()).toBe(deleteRes)

    const bufferRes2 = await readFile(testFileDir2)
    expect(bufferRes2.toString()).toBe(deleteRes)
  })

  test('removeInjectImporter should remove lines matching unplugin-vue-cssvars=true', () => {
    const input = `
    import foo from 'bar';
    // unplugin-vue-cssvars=true
    import baz from 'qux';
    const code = 'hello world';
  `
    const expectedOutput = `
    import foo from 'bar';

    import baz from 'qux';
    const code = 'hello world';
  `
    expect(removeInjectImporter(input)).toEqual(expectedOutput)
  })

  test('removeInjectImporter should return original code if no lines match unplugin-vue-cssvars=true', () => {
    const input = `
    import foo from 'bar';
    const code = 'hello world';
  `
    expect(removeInjectImporter(input)).toEqual(input)
  })

  test('removeInjectImporter should handle empty code string', () => {
    expect(removeInjectImporter('')).toEqual('')
  })
})
