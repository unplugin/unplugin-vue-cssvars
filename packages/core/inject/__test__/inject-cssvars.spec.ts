import { describe, expect, test } from 'vitest'
import { createUseCssVarsCode, injectCSSVars, injectCSSVarsOnServer } from '../inject-cssvars'

describe('inject-cssvars', () => {
  test('createUseCssVarsCode: isHas is true & isScriptSetup is true', () => {
    const code = `_useCssVars((_ctx) => ({
      "c5743bc8": test,
    })`
    const vbindVariableList1 = [{ has: true, value: 'color', isRef: true }]
    const res1 = createUseCssVarsCode(code, vbindVariableList1, true, true)
    expect(res1).toContain('color.value')
    expect(res1).toContain('"c5743bc8": test,')
    expect(res1).not.toContain('__injectCSSVars__ = () => {')

    const vbindVariableList2 = [{ has: false, value: 'color', isRef: true }]
    const res2 = createUseCssVarsCode(code, vbindVariableList2, true, true)
    expect(res2).toContain('color.value')
    expect(res2).toContain('"c5743bc8": test,')
    expect(res2).not.toContain('__injectCSSVars__ = () => {')

    const vbindVariableList3 = [{ has: true, value: 'color', isRef: false }]
    const res3 = createUseCssVarsCode(code, vbindVariableList3, true, true)
    expect(res3).toContain('color')
    expect(res3).toContain('"c5743bc8": test,')
    expect(res3).not.toContain('__injectCSSVars__ = () => {')

    const vbindVariableList4 = [{ has: false, value: 'color', isRef: false }]
    const res4 = createUseCssVarsCode(code, vbindVariableList4, true, true)
    expect(res4).toContain('_ctx.color')
    expect(res4).toContain('"c5743bc8": test,')
    expect(res4).not.toContain('__injectCSSVars__ = () => {')
  })

  test('createUseCssVarsCode: isHas is false & isScriptSetup is false', () => {
    const code = ''
    const vbindVariableList1 = [{ has: true, value: 'color', isRef: true }]
    const res1 = createUseCssVarsCode(code, vbindVariableList1, false, false)
    expect(res1).toContain('_ctx.color')
    expect(res1).toContain('__injectCSSVars__ = () => {')

    const vbindVariableList2 = [{ has: false, value: 'color', isRef: true }]
    const res2 = createUseCssVarsCode(code, vbindVariableList2, false, false)
    expect(res2).toContain('_ctx.color')
    expect(res2).toContain('__injectCSSVars__ = () => {')

    const vbindVariableList3 = [{ has: true, value: 'color', isRef: false }]
    const res3 = createUseCssVarsCode(code, vbindVariableList3, false, false)
    expect(res3).toContain('_ctx.color')
    expect(res3).toContain('__injectCSSVars__ = () => {')

    const vbindVariableList4 = [{ has: false, value: 'color', isRef: false }]
    const res4 = createUseCssVarsCode(code, vbindVariableList4, false, false)
    expect(res4).toContain('_ctx.color')
    expect(res4).toContain('__injectCSSVars__ = () => {')
  })

  test('createUseCssVarsCode: isHas is true & isScriptSetup is false', () => {
    const code = `_useCssVars((_ctx) => ({
      "c5743bc8": test,
    })`
    const vbindVariableList1 = [{ has: true, value: 'color', isRef: true }]
    const res1 = createUseCssVarsCode(code, vbindVariableList1, true, false)
    expect(res1).toContain('_ctx.color')
    expect(res1).toContain('"c5743bc8": test,')
    expect(res1).not.toContain('__injectCSSVars__ = () => {')

    const vbindVariableList2 = [{ has: false, value: 'color', isRef: true }]
    const res2 = createUseCssVarsCode(code, vbindVariableList2, true, false)
    expect(res2).toContain('_ctx.color')
    expect(res2).toContain('"c5743bc8": test,')
    expect(res2).not.toContain('__injectCSSVars__ = () => {')

    const vbindVariableList3 = [{ has: true, value: 'color', isRef: false }]
    const res3 = createUseCssVarsCode(code, vbindVariableList3, true, false)
    expect(res3).toContain('_ctx.color')
    expect(res3).toContain('"c5743bc8": test,')
    expect(res3).not.toContain('__injectCSSVars__ = () => {')

    const vbindVariableList4 = [{ has: false, value: 'color', isRef: false }]
    const res4 = createUseCssVarsCode(code, vbindVariableList4, true, false)
    expect(res4).toContain('_ctx.color')
    expect(res4).toContain('"c5743bc8": test,')
    expect(res4).not.toContain('__injectCSSVars__ = () => {')
  })

  test('createUseCssVarsCode: isHas is false & isScriptSetup is true', () => {
    const code = ''
    const vbindVariableList1 = [{ has: true, value: 'color', isRef: true }]
    const res1 = createUseCssVarsCode(code, vbindVariableList1, false, true)
    expect(res1).toContain('color.value')
    expect(res1).not.toContain('__injectCSSVars__ = () => {')

    const vbindVariableList2 = [{ has: false, value: 'color', isRef: true }]
    const res2 = createUseCssVarsCode(code, vbindVariableList2, false, true)
    expect(res2).toContain('color.value')
    expect(res2).not.toContain('__injectCSSVars__ = () => {')

    const vbindVariableList3 = [{ has: true, value: 'color', isRef: false }]
    const res3 = createUseCssVarsCode(code, vbindVariableList3, false, true)
    expect(res3).toContain('color')
    expect(res3).not.toContain('__injectCSSVars__ = () => {')

    const vbindVariableList4 = [{ has: false, value: 'color', isRef: false }]
    const res4 = createUseCssVarsCode(code, vbindVariableList4, false, true)
    expect(res4).toContain('_ctx.color')
    expect(res4).not.toContain('__injectCSSVars__ = () => {')
  })

  test('createUseCssVarsCode: useCssVars(_ctx', () => {
    const code = `_useCssVars(_ctx => ({
      "c5743bc8": test,
    })`
    const vbindVariableList = [{ has: true, value: 'color', isRef: true }]
    const res = createUseCssVarsCode(code, vbindVariableList, true, true)
    expect(res).toContain('color.value')
    expect(res).toContain('"c5743bc8": test,')
    expect(res).not.toContain('__injectCSSVars__ = () => {')
    expect(res).not.toContain('_useCssVars(_ctx => ({')
    expect(res).toContain('_useCssVars((_ctx) => ({')
  })

  test('injectCSSVarsOnServer: isScriptSetup is true & hasUseCssVars is true', () => {
    const code = `_useCssVars(_ctx => ({
      "c5743bc8": test,
    })`
    const vbindVariableList = [{ has: true, value: 'color', isRef: true }]
    const res = injectCSSVarsOnServer(code, vbindVariableList, true)
    expect(res.code).toContain('color.value')
    expect(res.code).toContain('"c5743bc8": test,')
    expect(res.code).not.toContain('__injectCSSVars__ = () => {')
    expect(res.vbindVariableList[0].hash).toBeTruthy()
  })

  test('injectCSSVarsOnServer: isScriptSetup is false & hasUseCssVars is false', () => {
    const code = 'const _sfc_main = {};function _sfc_render(){}'
    const vbindVariableList = [{ has: true, value: 'color', isRef: true }]
    const res = injectCSSVarsOnServer(code, vbindVariableList, false)
    expect(res.code).toContain('_ctx.color')
    expect(res.code).toContain('__injectCSSVars__ = () => {')
    expect(res.code).not.toContain('const _sfc_main = {};')
    expect(res.code).toContain('const __default__')
    expect(res.vbindVariableList[0].hash).toBeTruthy()
  })

  test('injectCSSVarsOnServer: isScriptSetup is false & hasUseCssVars is true', () => {
    const code = `_useCssVars(_ctx => ({
      "c5743bc8": test,
    })`
    const vbindVariableList = [{ has: true, value: 'color', isRef: true }]
    const res = injectCSSVarsOnServer(code, vbindVariableList, false)
    expect(res.code).toContain('_ctx.color')
    expect(res.code).toContain('"c5743bc8": test,')
    expect(res.code).not.toContain('__injectCSSVars__ = () => {')
    expect(res.vbindVariableList[0].hash).toBeTruthy()
  })

  test('injectCSSVarsOnServer: isScriptSetup is true & hasUseCssVars is false', () => {
    const code = 'setup(__props, { expose }) {}'
    const vbindVariableList = [{ has: true, value: 'color', isRef: true }]
    const res = injectCSSVarsOnServer(code, vbindVariableList, true)
    expect(res.code).toContain('color.value')
    expect(res.code).toContain('setup(__props, { expose }) {\n'
      + '     _useCssVars((_ctx) => ({')
    expect(res.code).not.toContain('setup(__props, { expose }) {}')
    expect(res.vbindVariableList[0].hash).toBeTruthy()
  })

  test('injectCSSVars: basic', () => {
    const vbindVariableList = [{ has: true, value: 'color', isRef: true }]
    const res = injectCSSVars('setup(__props, { expose }) {}', vbindVariableList, true)
    expect(res.code).toContain('import { useCssVars as _useCssVars } from "vue"\n'
      + 'setup(__props, { expose }) {\n'
      + '     _useCssVars((_ctx) => ({')
    expect(res.vbindVariableList![0].hash).toBeTruthy()
  })

  test('injectCSSVars: vbindVariableList is undefined or empty array', () => {
    const res1 = injectCSSVars('test', undefined, false)
    expect(res1.code).toBe('test')
    expect(res1.vbindVariableList).toBe(undefined)

    const res2 = injectCSSVars('test', [], false)
    expect(res2.code).toBe('test')
    expect(res1.vbindVariableList).toBe(undefined)
  })
})
