import { describe, expect, test } from 'vitest'
import MagicString from 'magic-string'
import {
  createCSSVarsObjCode,
  createUCVCOptionUnHas,
  createUCVCSetupUnHas,
  createUseCssVarsCode, injectCSSVars,
  injectCSSVarsOnServer,
  injectUseCssVarsOption,
  injectUseCssVarsSetup,
} from '../inject-cssvars'
import { parserCompiledSfc } from '../../parser'

describe('inject-cssvars', () => {
  describe('createUCVCOptionUnHas', () => {
    test('returns a string containing the injected CSS variables', () => {
      const resCode = 'color: var(--text-color); font-size: var(--font-size);'
      const result = createUCVCOptionUnHas(resCode)
      expect(result).toContain('__injectCSSVars__')
      expect(result).toContain('useCssVars')
      expect(result).toContain(resCode)
    })
  })

  describe('createUCVCSetupUnHas', () => {
    test('returns a string containing the injected CSS variables', () => {
      const cssvarsObjectCode = '{ "--text-color": "red", "--font-size": "16px" }'
      const result = createUCVCSetupUnHas(cssvarsObjectCode)
      expect(result).toContain('useCssVars')
      expect(result).toContain(cssvarsObjectCode)
    })
  })

  describe('createUseCssVarsCode', () => {
    test('returns a string containing the injected CSS variables for script setup', () => {
      const cssvarsObjectCode = '{ "--text-color": "red", "--font-size": "16px" }'
      const isScriptSetup = true
      const expected = createUCVCSetupUnHas(cssvarsObjectCode)
      const result = createUseCssVarsCode(cssvarsObjectCode, isScriptSetup)
      expect(result).toBe(expected)
    })

    test('returns a string containing the injected CSS variables for composition api and option api', () => {
      const cssvarsObjectCode = '{ "--text-color": "red", "--font-size": "16px" }'
      const isScriptSetup = false
      const expected = createUCVCOptionUnHas(cssvarsObjectCode)
      const result = createUseCssVarsCode(cssvarsObjectCode, isScriptSetup)
      expect(result).toBe(expected)
    })
  })

  describe('createCSSVarsObjCode', () => {
    test('should return empty string if vbindVariableList is empty', () => {
      const vbindVariableList: any[] = []
      const result = createCSSVarsObjCode(vbindVariableList, false)
      expect(result).toBe('')
    })

    test('isScriptSetup=false, has=false, hash=false, isRef=false', () => {
      const vbindVariableList = [{ value: 'color', has: false, hash: false, isRef: false }]
      const result = createCSSVarsObjCode(vbindVariableList as any, false)
      expect(result).toContain('_ctx.color')
    })

    test('isScriptSetup=false, has=false, hash=false, isRef=true', () => {
      const vbindVariableList = [{ value: 'color', has: false, hash: false, isRef: true }]
      const result = createCSSVarsObjCode(vbindVariableList as any, false)
      expect(result).toContain('_ctx.color')
    })

    test('isScriptSetup=false, has=false, hash=true, isRef=false', () => {
      const vbindVariableList = [{ value: 'color', has: false, hash: 'color', isRef: false }]
      const result = createCSSVarsObjCode(vbindVariableList as any, false)
      expect(result).toContain('_ctx.color')
      expect(result).toContain('"color":')
    })

    test('isScriptSetup=false, has=false, hash=true, isRef=true', () => {
      const vbindVariableList = [{ value: 'color', has: false, hash: 'color', isRef: true }]
      const result = createCSSVarsObjCode(vbindVariableList as any, false)
      expect(result).toContain('_ctx.color')
      expect(result).toContain('"color":')
    })

    test('isScriptSetup=false, has=true, hash=false, isRef=false', () => {
      const vbindVariableList = [{ value: 'color', has: true, hash: false, isRef: false }]
      const result = createCSSVarsObjCode(vbindVariableList as any, false)
      expect(result).toContain('_ctx.color')
    })

    test('isScriptSetup=false, has=true, hash=false, isRef=true', () => {
      const vbindVariableList = [{ value: 'color', has: true, hash: false, isRef: true }]
      const result = createCSSVarsObjCode(vbindVariableList as any, false)
      expect(result).toContain('_ctx.color')
    })

    test('isScriptSetup=false, has=true, hash=true, isRef=false', () => {
      const vbindVariableList = [{ value: 'color', has: true, hash: 'color', isRef: false }]
      const result = createCSSVarsObjCode(vbindVariableList as any, false)
      expect(result).toContain('_ctx.color')
      expect(result).toContain('"color":')
    })

    test('isScriptSetup=false, has=true, hash=true, isRef=true', () => {
      const vbindVariableList = [{ value: 'color', has: true, hash: 'color', isRef: true }]
      const result = createCSSVarsObjCode(vbindVariableList as any, false)
      expect(result).toContain('_ctx.color')
      expect(result).toContain('"color":')
    })

    test('isScriptSetup=true, has=false, hash=false, isRef=false', () => {
      const vbindVariableList = [{ value: 'color', has: false, hash: false, isRef: false }]
      const result = createCSSVarsObjCode(vbindVariableList as any, true)
      expect(result).toContain('_ctx.color')
    })

    test('isScriptSetup=true, has=false, hash=false, isRef=true', () => {
      const vbindVariableList = [{ value: 'color', has: false, hash: false, isRef: true }]
      const result = createCSSVarsObjCode(vbindVariableList as any, true)
      expect(result).toContain('color.value')
    })

    test('isScriptSetup=true, has=false, hash=true, isRef=false', () => {
      const vbindVariableList = [{ value: 'color', has: false, hash: 'color', isRef: false }]
      const result = createCSSVarsObjCode(vbindVariableList as any, true)
      expect(result).toContain('_ctx.color')
      expect(result).toContain('"color":')
    })

    test('isScriptSetup=true, has=false, hash=true, isRef=true', () => {
      const vbindVariableList = [{ value: 'color', has: false, hash: 'color', isRef: true }]
      const result = createCSSVarsObjCode(vbindVariableList as any, true)
      expect(result).toContain('color.value')
      expect(result).toContain('"color":')
    })

    test('isScriptSetup=true, has=true, hash=false, isRef=false', () => {
      const vbindVariableList = [{ value: 'color', has: true, hash: false, isRef: false }]
      const result = createCSSVarsObjCode(vbindVariableList as any, true)
      expect(result).toContain('color')
    })

    test('isScriptSetup=true, has=true, hash=false, isRef=true', () => {
      const vbindVariableList = [{ value: 'color', has: true, hash: false, isRef: true }]
      const result = createCSSVarsObjCode(vbindVariableList as any, true)
      expect(result).toContain('color.value')
    })

    test('isScriptSetup=true, has=true, hash=true, isRef=false', () => {
      const vbindVariableList = [{ value: 'color', has: true, hash: 'color', isRef: false }]
      const result = createCSSVarsObjCode(vbindVariableList as any, true)
      expect(result).toContain('color,')
      expect(result).toContain('"color":')
    })

    test('isScriptSetup=true, has=true, hash=true, isRef=true', () => {
      const vbindVariableList = [{ value: 'color', has: true, hash: 'color', isRef: true }]
      const result = createCSSVarsObjCode(vbindVariableList as any, true)
      expect(result).toContain('color.value')
      expect(result).toContain('"color":')
    })

    test('avoid repeated injections', () => {
      const mockCode = '\n            "color": color.value,'
      const vbindVariableList = [{ value: 'color', has: true, hash: 'color', isRef: true }]
      const result = createCSSVarsObjCode(vbindVariableList as any, true, new MagicString(mockCode))
      expect(result).not.toBeTruthy()
    })
  })
  describe('injectUseCssVarsOption', () => {
    test('hasUseCssVars is false', () => {
      const mockContent = 'const _sfc_main = {};function _sfc_render(){}'
      const mgcStr = new MagicString(mockContent)
      const parserRes = parserCompiledSfc(mockContent)
      const useCssVars = 'const __injectCSSVars__ = () => {}'
      const result = injectUseCssVarsOption(
        mgcStr,
        useCssVars,
        false,
        parserRes,
      )
      expect(result.toString()).toMatchSnapshot()
    })

    test('hasUseCssVars is true', () => {
      const mockContent = 'import { useCssVars as _useCssVars } from \'vue\'\n'
        + 'const __injectCSSVars__ = () => {\n'
        + '_useCssVars(_ctx => ({\n'
        + '  "229090c3-sassColor": (_ctx.sassColor)\n'
        + '}))}\n'
        + 'const __setup__ = __default__.setup\n'
        + '__default__.setup = __setup__\n'
        + '  ? (props, ctx) => { __injectCSSVars__();return __setup__(props, ctx) }\n'
        + '  : __injectCSSVars__\n'
        + '\n'
        + 'const _sfc_main = __default__'
      const mgcStr = new MagicString(mockContent)
      const parserRes = parserCompiledSfc(mockContent)
      const useCssVars = '\n"color": (_ctx.color),\n'
      const result = injectUseCssVarsOption(
        mgcStr,
        useCssVars,
        true,
        parserRes,
      )
      expect(result.toString()).toMatchSnapshot()
    })
  })

  describe('injectUseCssVarsSetup', () => {
    test('hasUseCssVars is true', () => {
      const mockContent = 'function setup() {  '
        + '_useCssVars((_ctx) => ({\n'
        + '    "229090c3-sassColor": sassColor.value\n'
        + '})); }'
      const mgcStr = new MagicString(mockContent)
      const useCssVars = '"1439c43b": color.value,'
      const resMgcStr = injectUseCssVarsSetup(
        mgcStr,
        useCssVars,
        true,
        parserCompiledSfc(mockContent))
      expect(resMgcStr.toString()).toMatchSnapshot()
    })

    test('hasUseCssVars is false', () => {
      const mockContent = 'function setup() {}'
      const mgcStr = new MagicString(mockContent)
      const useCssVars = createUseCssVarsCode(
        '"1439c43b": color.value,',
        true)
      const resMgcStr = injectUseCssVarsSetup(
        mgcStr,
        useCssVars,
        false,
        parserCompiledSfc(mockContent))

      expect(resMgcStr.toString()).toMatchSnapshot()
    })
  })

  describe('injectCSSVarsOnServer', () => {
    test('isScriptSetup=false hasUseCssVars=false', () => {
      const mockContent = 'const _sfc_main = {};function _sfc_render(){}'
      const parseRes = parserCompiledSfc(mockContent)
      const mgcStr = new MagicString(mockContent)
      const res = injectCSSVarsOnServer(
        [{ value: 'color', has: false, isRef: true }] as any,
        false,
        parseRes,
        mgcStr)
      expect(res.mgcStr.toString()).toContain('_ctx.color')
      expect(res.mgcStr.toString()).toContain('_useCssVars')
      expect(res.mgcStr.toString()).toContain('_useCssVars')
    })

    test('isScriptSetup=true hasUseCssVars=true', () => {
      const mockContent = 'const _sfc_main = /* @__PURE__ */ _defineComponent({\n'
        + '  __name: "App",\n'
        + '  setup(__props, { expose }) {\n'
        + '    expose();\n'
        + '    _useCssVars((_ctx) => ({\n'
        + '      "229090c3-sassColor": sassColor.value\n'
        + '    }));\n'
        + '    const color = ref("red");\n'
        + '    const sassColor = ref("#94c9ff");\n'
        + '    return { color, sassColor }\n'
        + '  }\n'
        + '});'
      const parseRes = parserCompiledSfc(mockContent)
      const mgcStr = new MagicString(mockContent)
      const res = injectCSSVarsOnServer(
        [{ value: 'color', has: true, isRef: true }] as any,
        true,
        parseRes,
        mgcStr)
      expect(res.mgcStr.toString()).toContain('color.value')
    })

    test('isScriptSetup=false hasUseCssVars=true', () => {
      const mockContent = 'import { useCssVars as _useCssVars } from \'vue\'\n'
        + 'const __injectCSSVars__ = () => {\n'
        + '_useCssVars(_ctx => ({\n'
        + '  "229090c3-sassColor": (_ctx.sassColor)\n'
        + '}))}\n'
        + 'const __setup__ = __default__.setup\n'
        + '__default__.setup = __setup__\n'
        + '  ? (props, ctx) => { __injectCSSVars__();return __setup__(props, ctx) }\n'
        + '  : __injectCSSVars__\n'
        + '\n'
        + 'const _sfc_main = __default__'

      const parseRes = parserCompiledSfc(mockContent)
      const mgcStr = new MagicString(mockContent)
      const res = injectCSSVarsOnServer(
        [{ value: 'color', has: true, isRef: true }] as any,
        false,
        parseRes,
        mgcStr)
      expect(res.mgcStr.toString()).toContain('_ctx.color')
    })

    test('isScriptSetup=true hasUseCssVars=false', () => {
      const mockContent = 'const _sfc_main = /* @__PURE__ */ _defineComponent({\n'
        + '  __name: "App",\n'
        + '  setup(__props, { expose }) {\n'
        + '    expose();\n'
        + '    const color = ref("red");\n'
        + '    const sassColor = ref("#94c9ff");\n'
        + '    return { color, sassColor }\n'
        + '  }\n'
        + '});'
      const parseRes = parserCompiledSfc(mockContent)
      const mgcStr = new MagicString(mockContent)
      const res = injectCSSVarsOnServer(
        [{ value: 'color', has: false, isRef: true }] as any,
        true,
        parseRes,
        mgcStr)
      expect(res.mgcStr.toString()).toContain('color.value')
      expect(res.mgcStr.toString()).toContain('_useCssVars')
    })
  })

  describe('injectCSSVars', () => {
    test('basic', () => {
      const mockContent = 'const _sfc_main = /* @__PURE__ */ _defineComponent({\n'
        + '  __name: "App",\n'
        + '  setup(__props, { expose }) {\n'
        + '    expose();\n'
        + '    const color = ref("red");\n'
        + '    const sassColor = ref("#94c9ff");\n'
        + '    return { color, sassColor }\n'
        + '  }\n'
        + '});'
      const parseRes = parserCompiledSfc(mockContent)
      const mgcStr = new MagicString(mockContent)
      const res = injectCSSVars(
        [{ value: 'color', has: false, isRef: true }] as any,
        true,
        parseRes,
        mgcStr)
      expect(res.mgcStr.toString()).toContain('color.value')
      expect(res.mgcStr.toString()).toContain('_useCssVars')
    })

    test('vbindVariableList is empty', () => {
      const mockContent = 'const _sfc_main = /* @__PURE__ */ _defineComponent({\n'
        + '  __name: "App",\n'
        + '  setup(__props, { expose }) {\n'
        + '    expose();\n'
        + '    const color = ref("red");\n'
        + '    const sassColor = ref("#94c9ff");\n'
        + '    return { color, sassColor }\n'
        + '  }\n'
        + '});'
      const parseRes = parserCompiledSfc(mockContent)
      const mgcStr = new MagicString(mockContent)
      const res = injectCSSVars(
        [] as any,
        true,
        parseRes,
        mgcStr)
      expect(res.mgcStr.toString()).toContain(mockContent)

      const res2 = injectCSSVars(
        null!,
        true,
        parseRes,
        mgcStr)
      expect(res2.mgcStr.toString()).toContain(mockContent)
    })
  })
})
