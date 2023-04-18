import { resolve } from 'path'
import { beforeEach, describe, expect, test } from 'vitest'
import { transformSymbol } from '@unplugin-vue-cssvars/utils'
import { triggerSFCUpdate, updatedCSSModules } from '../hmr'

const mockOption = {
  rootDir: resolve(),
  include: [/.vue/],
  includeCompile: ['**/**.scss', '**/**.css'],
  server: true,
}
const file = transformSymbol(`${resolve()}/packages/core/hmr/__test__/style/foo.css`)
const mockModuleNode = new Set<any>()
mockModuleNode.add({ id: 'foo.vue' })

const mockFileToModulesMap = new Map()
mockFileToModulesMap.set('../D/test', mockModuleNode)

let hmrModule = null
const mockServer = {
  reloadModule: (m) => {
    hmrModule = m
  },
  moduleGraph: {
    fileToModulesMap: mockFileToModulesMap,
  },
}
beforeEach(() => {
  hmrModule = null
})
describe('HMR', () => {
  test('HMR: updatedCSSModules', () => {
    const CSSFileModuleMap = new Map()
    CSSFileModuleMap.set(file, {
      importer: new Set(),
      vBindCode: ['foo'],
    })
    updatedCSSModules(CSSFileModuleMap, mockOption, file)
    expect(CSSFileModuleMap.get(file).content).toBeTruthy()
    expect(CSSFileModuleMap.get(file).vBindCode).toMatchObject(['test'])
  })

  test('HMR: triggerSFCUpdate basic', () => {
    const CSSFileModuleMap = new Map()
    CSSFileModuleMap.set(file, {
      importer: new Set(),
      vBindCode: ['foo'],
      sfcPath: new Set(['../D/test']),
    })

    triggerSFCUpdate(CSSFileModuleMap, mockOption, {
      importer: new Set(),
      vBindCode: ['foo'],
      sfcPath: new Set(['../D/test']),
    } as any, file, mockServer as any)
    expect(CSSFileModuleMap.get(file).content).toBeTruthy()
    expect(CSSFileModuleMap.get(file).vBindCode).toMatchObject(['test'])
    expect(hmrModule).toMatchObject({ id: 'foo.vue' })
  })

  test('HMR: triggerSFCUpdate sfcPath is undefined', () => {
    const CSSFileModuleMap = new Map()
    CSSFileModuleMap.set(file, {
      importer: new Set(),
      vBindCode: ['foo'],
      sfcPath: new Set(['../D/test']),
    })

    triggerSFCUpdate(CSSFileModuleMap, mockOption, {
      importer: new Set(),
      vBindCode: ['foo'],
    } as any, file, mockServer as any)
    expect(CSSFileModuleMap.get(file).content).not.toBeTruthy()
    expect(CSSFileModuleMap.get(file).vBindCode).toMatchObject(['foo'])
    expect(hmrModule).not.toBeTruthy()
  })

  test('HMR: triggerSFCUpdate sfcPath is empty', () => {
    const CSSFileModuleMap = new Map()
    CSSFileModuleMap.set(file, {
      importer: new Set(),
      vBindCode: ['foo'],
      sfcPath: new Set(['../D/test']),
    })

    triggerSFCUpdate(CSSFileModuleMap, mockOption, {
      importer: new Set(),
      vBindCode: ['foo'],
      sfcPath: new Set(),
    } as any, file, mockServer as any)
    expect(CSSFileModuleMap.get(file).content).not.toBeTruthy()
    expect(CSSFileModuleMap.get(file).vBindCode).toMatchObject(['foo'])
    expect(hmrModule).not.toBeTruthy()
  })
})
