import { describe, expect, test } from 'vitest'
import { handleVBindVariable } from '../handle-variable'
import { CSSVarsBindingTypes } from '../../parser/utils'
import code from './sfc/mock-sfc.vue?raw'
const mockId = 'D:/project-github/unplugin-vue-cssvars/play/vite/src/views/app/App.vue'
const mockCode = code
const initMockCtx = () => {
  return {
    bindingsTypeMap: {
      [mockId]: {
        sassColor: CSSVarsBindingTypes.SETUP_REF,
        color: CSSVarsBindingTypes.SETUP_REF,
      },
    },
    CSSFileModuleMap: new Map(),
    vbindVariableList: new Map(),
    isScriptSetup: false,
    isServer: true,
    userOptions: {
      alias: {
        '@': 'D:\\project-github\\unplugin-vue-cssvars\\play\\vite\\src',
      },
    },
  }
}
const initMockCSSFileModuleMap = (mockContext: any) => {
  mockContext.CSSFileModuleMap.set(
    'D:/project-github/unplugin-vue-cssvars/play/vite/src/assets/css/foo.css',
    {
      vBindCode: ['sassColor', 'color'],
      content: '#foo{\n'
        + '  color: v-bind-m(sassColor);\n'
        + '  background: #ffebf8;\n'
        + '  width: 200px;\n'
        + '  height: 30px;\n'
        + '}\n'
        + 'p {\n'
        + '  color: v-bind-m(color);\n'
        + '}\n',
      lang: 'css',
      importer: new Set(),
    },
  )
}
describe('handle variable', () => {
  test('handleVBindVariable: basic', () => {
    const mockContext = initMockCtx()
    initMockCSSFileModuleMap(mockContext)
    handleVBindVariable(mockCode, mockId, mockContext as any)
    expect(mockContext.isScriptSetup).toBeTruthy()
    expect(mockContext.vbindVariableList.get(mockId)).toMatchObject([
      { value: 'sassColor', has: true, isRef: true },
      { value: 'color', has: true, isRef: true },
    ])
  })

  test('handleVBindVariable: server is false', () => {
    const mockContext = initMockCtx()
    mockContext.isServer = false
    initMockCSSFileModuleMap(mockContext)
    const res = handleVBindVariable(mockCode, mockId, mockContext as any)
    expect(mockContext.isScriptSetup).toBeTruthy()
    expect(mockContext.vbindVariableList.get(mockId)).toMatchObject([
      { value: 'sassColor', has: true, isRef: true },
      { value: 'color', has: true, isRef: true },
    ])
    expect(res.injectCSSContent).toMatchSnapshot()
  })
})
