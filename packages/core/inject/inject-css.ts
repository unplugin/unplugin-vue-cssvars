import hash from 'hash-sum'
import { type MagicStringBase } from 'magic-string-ast'
import { transformInjectCSS } from '../transform/transform-inject-css'
import { parseImports } from '../parser'
import type { TInjectCSSContent } from '../runtime/process-css'
import type { SFCDescriptor } from '@vue/compiler-sfc'
import type { TMatchVariable } from '../parser'
export function injectCssOnServer(
  mgcStr: MagicStringBase,
  vbindVariableList: TMatchVariable | undefined,
  isHmring: boolean,
) {
  vbindVariableList && vbindVariableList.forEach((vbVar) => {
    // 样式文件修改后，热更新会先于 sfc 热更新运行，这里先设置hash
    // 详见 packages/core/index.ts的 handleHotUpdate
    if (!vbVar.hash && isHmring)
      vbVar.hash = hash(vbVar.value + vbVar.has)

    vbVar.hash && (mgcStr = mgcStr.replaceAll(`v-bind-m(${vbVar.value})`, `var(--${vbVar.hash})`))
  })
  return mgcStr
}

export function injectCssOnBuild(
  mgcStr: MagicStringBase,
  injectCSSContent: TInjectCSSContent,
  descriptor: SFCDescriptor) {
  const cssContent = [...injectCSSContent]
  let resCode = ''

  descriptor.styles && descriptor.styles.forEach((value, index) => {
    let injectCssCode = ''
    cssContent.forEach((value) => {
      if (value.styleTagIndex === index)
        injectCssCode = `${injectCssCode}\n${transformInjectCSS(value.content, parseImports(value.content).imports)}`
    })
    const lang = value.lang || 'css'
    const scoped = value.scoped ? 'scoped' : ''
    resCode = `<style lang="${lang}" ${scoped}> ${injectCssCode}\n${transformInjectCSS(value.content, parseImports(value.content).imports)} </style>`
  })
  resCode && (mgcStr = removeStyleTagsAndContent(mgcStr))
  return mgcStr.prependRight(mgcStr.length(), resCode)
}

export function removeStyleTagsAndContent(mgcStr: MagicStringBase): MagicStringBase {
  return mgcStr.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<style\b[^>]*>/gi, '').replace(/<\/style>/gi, '')
}
