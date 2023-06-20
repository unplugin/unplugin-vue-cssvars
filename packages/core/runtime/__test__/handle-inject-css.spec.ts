import { describe, expect, test } from 'vitest'
import MagicString from 'magic-string'
import { handleInjectCss } from '../handle-inject-css'
import code from './sfc/mock-code.txt?raw'
import {CSSVarsBindingTypes} from "../../parser/utils";
describe('handle inject css', () => {
  test('handleInjectCss: basic', () => {
    const mockId = 'D:/project-github/unplugin-vue-cssvars/play/vite/src/views/app/App.vue'
    const mockCode = code
    const mockMgc = new MagicString(code)
    const mockContext = {
      vbindVariableList: new Map(),
      isScriptSetup: true,
      bindingsTypeMap: {
        [mockId]: {
          sassColor: CSSVarsBindingTypes.SETUP_REF,
          color: CSSVarsBindingTypes.SETUP_REF
        }
      }
    }
    mockContext.vbindVariableList.set(mockId, [
      { value: 'sassColor', has: true, isRef: true },
      { value: 'color', has: true, isRef: true },
    ])
    const res = handleInjectCss(mockId, mockCode, mockMgc, mockContext as any)
    expect(res.toString()).toMatchSnapshot()
  })
})
