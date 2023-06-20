import hash from 'hash-sum'
import { transformInjectCSS } from '../transform/transform-inject-css'
import {parseCssVars, parseImports} from '../parser'
import type { MagicStringBase } from 'magic-string-ast'
import type { TInjectCSSContent } from '../runtime/process-css'
import type { SFCDescriptor } from '@vue/compiler-sfc'
import type { TMatchVariable } from '../parser'
declare type PCSSVARARR = Array<{
  start: number,
  end: number,
  offset: number,
  variable: string}>
export function injectCSSOnServer(
  mgcStr: MagicStringBase,
  vbindVariableList: TMatchVariable | undefined,
  isHMR: boolean,
) {

  const pCssVarsArr:PCSSVARARR = []
  parseCssVars([mgcStr.toString()], {
    getIndex(start: number, end: number, offset, variable) {
      pCssVarsArr.push({start, end, offset, variable})
    }
  })

  pCssVarsArr.forEach(pca => {
    if(vbindVariableList){
      for (let i = 0; i < vbindVariableList.length; i++) {
        const vbVar = vbindVariableList[i]
        // 样式文件修改后，style热更新可能会先于 sfc 热更新运行，这里先设置hash
        // 详见 packages/core/index.ts的 handleHotUpdate
        if (!vbVar.hash && isHMR)
          vbVar.hash = hash(vbVar.value + vbVar.has)

        if(vbVar.value === pca.variable){
          const offset = pca.offset
          const start = pca.start + offset
          const end = pca.end + offset
          vbVar.hash && (mgcStr = mgcStr.overwrite(start, end, `--${vbVar.hash}`))
          break
        }
      }
    }
  })

  mgcStr = mgcStr.replace(/v-bind-m\s*\(/g, "var(");
  return mgcStr
}

export function injectCssOnBuild(
  mgcStr: MagicStringBase,
  injectCSSContent: TInjectCSSContent | null,
  descriptor: SFCDescriptor | null) {
  if (!injectCSSContent && !descriptor) return mgcStr
  const cssContent = [...injectCSSContent!]
  let resCode = ''

  descriptor!.styles && descriptor!.styles.forEach((value, index) => {
    let injectCssCode = ''
    cssContent.forEach((value) => {
      if (value.styleTagIndex === index)
        injectCssCode = `${injectCssCode}\n${transformInjectCSS(value.content, parseImports(value.content).imports)}`
    })
    const lang = value.lang || 'css'
    const scoped = value.scoped ? 'scoped' : ''
    resCode = `${resCode}\n<style lang="${lang}" ${scoped}> ${injectCssCode}\n${transformInjectCSS(value.content, parseImports(value.content).imports)} </style>`
  })
  resCode && (mgcStr = removeStyleTagsAndContent(mgcStr))
  return mgcStr.prependRight(mgcStr.length(), resCode)
}

export function removeStyleTagsAndContent(mgcStr: MagicStringBase): MagicStringBase {
  return mgcStr.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<style\b[^>]*>/gi, '').replace(/<\/style>/gi, '')
}
