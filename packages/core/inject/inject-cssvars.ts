import { setTArray } from '@unplugin-vue-cssvars/utils'
import type { Identifier } from '@babel/types'
import type { ICSSFile } from '../types'

export const injectCSSVars = (
  code: string,
  importCSSModule: Array<ICSSFile>,
  variableName: Record<string, Identifier>) => {
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
  /**
   * ⭐⭐⭐ TODO: 标记被提升的样式，然后删除它
   */
  code = code.replace('</style>', `${injectCSSSet.join('')}\n</style>`)
  return code
}
