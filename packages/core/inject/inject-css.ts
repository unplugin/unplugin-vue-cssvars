import hash from 'hash-sum'
import { transformInjectCSS } from '../transform/transform-inject-css'
import { parseImports } from '../parser'
import type { TInjectCSSContent } from '../runtime/process-css'
import type { SFCDescriptor } from '@vue/compiler-sfc'
import type { TMatchVariable } from '../parser'
export function injectCssOnServer(
  code: string,
  vbindVariableList: TMatchVariable | undefined,
  isHmring: boolean,
) {
  vbindVariableList && vbindVariableList.forEach((vbVar) => {
    // 样式文件修改后，热更新会先于 sfc 热更新运行，这里先设置hash
    // 详见 packages/core/index.ts的 handleHotUpdate
    if (!vbVar.hash && isHmring)
      vbVar.hash = hash(vbVar.value + vbVar.has)

    code = code.replaceAll(`v-bind-m(${vbVar.value})`, `var(--${vbVar.hash})`)
  })
  return code
}

export function injectCssOnBuild(
  code: string,
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
  code = removeStyleTagsAndContent(code)
  return `${code}\n ${resCode}`
}

export function removeStyleTagsAndContent(html: string): string {
  // 使用正则表达式匹配所有的style标签并替换为空字符串
  const newHtml = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  // 使用正则表达式匹配所有的style标签并替换为空字符串
  return newHtml.replace(/<style\b[^>]*>/gi, '').replace(/<\/style>/gi, '')
}
