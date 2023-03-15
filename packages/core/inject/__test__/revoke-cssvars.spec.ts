import { resolve } from 'path'
import { cwd } from 'node:process'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { pathExists, readFile, remove } from 'fs-extra'
import MagicString from 'magic-string'
import { deleteInjectCSS, findInjects, revokeCSSVars } from '../revoke-cssvars'
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
})
