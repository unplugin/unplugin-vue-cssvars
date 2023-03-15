import { setTArray } from '@unplugin-vue-cssvars/utils'
import type { ICSSFile, VariableName } from '../types'

export const injectCSSVars = (
  code: string,
  importCSSModule: Array<ICSSFile>,
  variableName: VariableName) => {
  let injectCSSSet: Array<string> = []
  importCSSModule.forEach((cssF: ICSSFile) => {
    const { vBindCode } = cssF
    if (vBindCode) {
      const vBindCodeKeys = Object.keys(vBindCode)
      vBindCodeKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(variableName, key))
          injectCSSSet = injectCSSSet.concat(setTArray(vBindCode[key]))
      })
    }
  })
  code = `${code}\n<style scoped>${injectCSSSet.join('')}\n</style>`
  return code
}
