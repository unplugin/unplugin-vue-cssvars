
import type { TMatchVariable } from '../parser'

// TODO unit test
export const injectCSSVars = (
  code: string,
  vbindVariableList: TMatchVariable) => {
  if (vbindVariableList.length === 0) return code
  if (code.includes('_useCssVars')) {

  } else {
    // TODO
    const importer = 'import { useCssVars as _useCssVars } from "vue"\n'
    const useCssVars = `
     _useCssVars((_ctx) => ({
      "b513251a": _ctx.color2
    }));
    `
  }

  return code
}
