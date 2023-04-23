
import hash from 'hash-sum'
import type { TMatchVariable } from '../parser'

const importer = 'import { useCssVars as _useCssVars } from "vue"\n'

export const injectCSSVars = (
  code: string,
  vbindVariableList: TMatchVariable | undefined,
  isScriptSetup: boolean,
) => {
  if (!vbindVariableList || vbindVariableList.length === 0) return { code, vbindVariableList }
  return injectCSSVarsOnServer(code, vbindVariableList, isScriptSetup)
}

// TODO use ast to impl
export function injectCSSVarsOnServer(
  code: string,
  vbindVariableList: TMatchVariable,
  isScriptSetup: boolean) {
  let resCode = ''
  const hasUseCssVars = code.includes('useCssVars')
  const useCssVars = createUseCssVarsCode(code, vbindVariableList, hasUseCssVars, isScriptSetup)
  if (isScriptSetup) {
    // setup script
    if (!hasUseCssVars) {
      // TODO: vite unit test
      if (code.includes('setup(__props, { expose }) {')) {
        resCode = code.replaceAll(
          'setup(__props, { expose }) {',
            `setup(__props, { expose }) {${useCssVars}`)
      }

      // TODO unit test webpack
      if (code.includes('setup: function (__props, _a) {')) {
        resCode = code.replaceAll(
          'setup: function (__props, _a) {',
            `setup: function (__props, _a) {${useCssVars}`)
      }

      resCode = resCode ? `${importer}${resCode}` : code
    } else {
      resCode = useCssVars
    }
  } else {
    // TODO: webpack
    // option api
    if (!hasUseCssVars) {
      resCode = code.replaceAll('const _sfc_main', 'const __default__')
      resCode = resCode.replaceAll(
        'function _sfc_render',
        `${useCssVars}\n
        const __setup__ = __default__.setup
        __default__.setup = __setup__
          ? (props, ctx) => { __injectCSSVars__(); return __setup__(props, ctx) }
            : __injectCSSVars__
            const _sfc_main = __default__
            function _sfc_render`)
      resCode = `${importer}${resCode}`
    } else {
      resCode = useCssVars
    }
  }

  return { code: resCode, vbindVariableList }
}

export function createUseCssVarsCode(
  code: string,
  vbindVariableList: TMatchVariable,
  isHas: boolean,
  isScriptSetup: boolean) {
  let cssvarsObjectCode = ''
  vbindVariableList.forEach((vbVar) => {
    // 如果 hash 存在，则说明是由热更新引起的，不需要重新设置 hash
    const hashVal = vbVar.hash || hash(vbVar.value + vbVar.has)
    vbVar.hash = hashVal
    let varStr = ''
    // composition api 和 option api 一直帶 _ctx
    if (!isScriptSetup) {
      varStr = `_ctx.${vbVar.value}`
    } else {
      // vbVar.has === false， 要带上 _ctx.
      varStr = vbVar.has ? vbVar.value : `_ctx.${vbVar.value}`
      // ref 用.value
      varStr = vbVar.isRef ? `${vbVar.value}.value` : varStr
    }
    cssvarsObjectCode = `"${hashVal}": ${varStr},\n  ${cssvarsObjectCode}`
  })
  let resCode = ''
  if (isHas) {
    // TODO: vite unit test
    if (code.includes('_useCssVars((_ctx')) {
      resCode = code.replaceAll(
        '_useCssVars((_ctx) => ({',
          `_useCssVars((_ctx) => ({\n  ${cssvarsObjectCode}`)
    }

    // TODO: vite unit test
    if (code.includes('_useCssVars(_ctx => ({')) {
      resCode = code.replaceAll(
        '_useCssVars(_ctx => ({',
          `_useCssVars((_ctx) => ({\n  ${cssvarsObjectCode}`)
    }

    // TODO: vite unit webpack
    if (code.includes('_useCssVars(function (_ctx) { return ({')) {
      resCode = code.replaceAll(
        '_useCssVars(function (_ctx) { return ({',
          `_useCssVars(function (_ctx) { return ({\n  ${cssvarsObjectCode}`)
    }
  } else {
    // setup script
    resCode = `
     _useCssVars((_ctx) => ({
      ${cssvarsObjectCode}
    }));`

    // composition api 和 option api
    // TODO: webpack
    if (!isScriptSetup) {
      resCode = `
      const __injectCSSVars__ = () => {\n
        ${resCode}\n
      };`
    }
  }
  return resCode
}
