import { describe, expect, test } from 'vitest'
import MagicString from 'magic-string'
import {
  createCSSVarsObjCode,
  createUCVCOptionUnHas,
  createUCVCSetupUnHas,
  createUseCssVarsCode,
  injectCSSVars,
  injectCSSVarsOnServer,
  injectUseCssVarsOption,
  injectUseCssVarsSetup,
} from '../inject-cssvars'
import { parserCompiledSfc } from '../../parser'
import { CSSVarsBindingTypes } from '../../parser/utils'

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
      expect(result).toContain('_ctx.color')
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
      expect(result).toContain('_ctx.color')
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
      expect(result).toContain('_ctx.color')
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
      expect(result).toContain('_ctx.color')
      expect(result).toContain('"color":')
    })

    test('avoid repeated injections', () => {
      const mockCode = '\n            "color": _ctx.color,'
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
      expect(res.mgcStr.toString()).toContain('_ctx.color')
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
      expect(res.mgcStr.toString()).toContain('_ctx.color')
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
      expect(res.mgcStr.toString()).toContain('_ctx.color')
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

    test('bindingTypes', () => {
      const mockContent = `
      const _sfc_main = /* @__PURE__ */ _defineComponent({
        __name: "App",
        props: {
          pcolor: {
                   type: String
          }
        },
        setup(__props, { expose }) {
           const color = ref('red')
           let foo = ref('foo')
           const color2 = reactive({ color: 'red' })
           let foo2 = reactive({ foo: 'foo' })
           const head2 = new Map()
           const color3 = 'red'
           const foo3 = { foo: 'foo' }
           const bar3 = 100
           const head3 = [1]
               
           let color4 = 'red'
           let foo4 = { foo: 'foo' }
           let bar4 = 100
           let head4 = [1]
        
           const fn = () => {}
           const fn2 = function (){}
           function fn3(){}
           let fn4 = () => {}
           let fn5 = function (){}
           const fn6 = () => {}
           const fn7 = fn()
           let fn8 = () => {}
           let fn9 = fn4()
           const a = {foo: 'foo', bar:'bar', head:{heads: 'hh'}}
           const {foo: fooAlias, bar, head: {heads: hh} } = a
          return {
            color,
            foo,
            color2,
            foo2,
            head2,
            color3,
            foo3,
            bar3,
            head3,
            color4,
            foo4,
            bar4,
            head4,
            fn1,
            fn2,
            fn3,
            fn4,
            fn5,
            fn6,
            fn7,
            fn8,
            fn9,
            a,
            fooAlias,
            bar,
            hh,
          }
        }
      })
      `
      const parseRes = parserCompiledSfc(mockContent)
      const mgcStr = new MagicString(mockContent)
      const res = injectCSSVars(
        [
          { value: 'color', has: true, isRef: true },
          { value: 'foo', has: true, isRef: true },
          { value: 'color2', has: true, isRef: false },
          { value: 'foo2', has: true, isRef: false },
          { value: 'head2', has: true, isRef: false },
          { value: 'color3', has: true, isRef: false },
          { value: 'foo3', has: true, isRef: false },
          { value: 'bar3', has: true, isRef: false },
          { value: 'head3', has: true, isRef: false },
          { value: 'color4', has: true, isRef: false },
          { value: 'foo4', has: true, isRef: false },
          { value: 'bar4', has: true, isRef: false },
          { value: 'head4', has: true, isRef: false },
          { value: 'fn1', has: true, isRef: false },
          { value: 'fn2', has: true, isRef: false },
          { value: 'fn3', has: true, isRef: false },
          { value: 'fn4', has: true, isRef: false },
          { value: 'fn5', has: true, isRef: false },
          { value: 'fn6', has: true, isRef: false },
          { value: 'fn7', has: true, isRef: false },
          { value: 'fn8', has: true, isRef: false },
          { value: 'fn9', has: true, isRef: false },
          { value: 'a', has: true, isRef: false },
          { value: 'fooAlias', has: true, isRef: false },
          { value: 'bar', has: true, isRef: false },
          { value: 'hh', has: true, isRef: false },
        ] as any,
        true,
        parseRes,
        mgcStr,
        {
          color: CSSVarsBindingTypes.SETUP_REF,
          foo: CSSVarsBindingTypes.SETUP_LET,
          color2: CSSVarsBindingTypes.SETUP_REACTIVE_CONST,
          foo2: CSSVarsBindingTypes.SETUP_LET,
          head2: CSSVarsBindingTypes.SETUP_MAYBE_REF,
          color3: CSSVarsBindingTypes.LITERAL_CONST,
          foo3: CSSVarsBindingTypes.SETUP_CONST,
          bar3: CSSVarsBindingTypes.LITERAL_CONST,
          head3: CSSVarsBindingTypes.SETUP_CONST,
          color4: CSSVarsBindingTypes.SETUP_LET,
          foo4: CSSVarsBindingTypes.SETUP_LET,
          bar4: CSSVarsBindingTypes.SETUP_LET,
          head4: CSSVarsBindingTypes.SETUP_LET,
          fn: CSSVarsBindingTypes.SETUP_CONST,
          fn2: CSSVarsBindingTypes.SETUP_CONST,
          fn3: CSSVarsBindingTypes.SETUP_CONST,
          fn4: CSSVarsBindingTypes.SETUP_LET,
          fn5: CSSVarsBindingTypes.SETUP_LET,
          fn6: CSSVarsBindingTypes.SETUP_CONST,
          fn7: CSSVarsBindingTypes.SETUP_MAYBE_REF,
          fn8: CSSVarsBindingTypes.SETUP_LET,
          fn9: CSSVarsBindingTypes.SETUP_LET,
          a: CSSVarsBindingTypes.SETUP_CONST,
          fooAlias: CSSVarsBindingTypes.SETUP_MAYBE_REF,
          bar: CSSVarsBindingTypes.SETUP_MAYBE_REF,
          hh: CSSVarsBindingTypes.SETUP_MAYBE_REF,
        })
      expect(res.mgcStr.toString()).toContain(' "75f73e04": _unref(hh),\n'
        + '            "0104392a": _unref(bar),\n'
        + '            "2bbe40ae": _unref(fooAlias),\n'
        + '            "770ddb39": a,\n'
        + '            "33bad66e": _unref(fn9),\n'
        + '            "33d70570": _unref(fn8),\n'
        + '            "33f33472": _unref(fn7),\n'
        + '            "340f6374": fn6,\n'
        + '            "342b9276": _unref(fn5),\n'
        + '            "3447c178": _unref(fn4),\n'
        + '            "3463f07a": fn3,\n'
        + '            "34801f7c": fn2,\n'
        + '            "349c4e7e": _ctx.fn1,\n'
        + '            "e29ebaa8": _unref(head4),\n'
        + '            "268cecf6": _unref(bar4),\n'
        + '            "6bb6f0b2": _unref(foo4),\n'
        + '            "6f79c2b5": _unref(color4),\n'
        + '            "e2bae9aa": head3,\n'
        + '            "26a91bf8": bar3,\n'
        + '            "6ba8d931": foo3,\n'
        + '            "6f6bab34": color3,\n'
        + '            "e2d718ac": _unref(head2),\n'
        + '            "6b9ac1b0": _unref(foo2),\n'
        + '            "6f5d93b3": color2,\n'
        + '            "2a5f3ac4": _unref(foo),\n'
        + '            "1439c43b": color.value,')
      expect(res.mgcStr.toString()).toContain('_useCssVars')
    })
  })
})
