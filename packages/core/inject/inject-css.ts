import { transformInjectCSS } from '../transform/transfrom-inject-css'
import { parseImports } from '../parser'
import type { SFCDescriptor } from '@vue/compiler-sfc'
import type { TMatchVariable } from '../parser'

// TODO unit test
export function injectCssOnServer(
  code: string,
  vbindVariableList: TMatchVariable | undefined,
) {
  vbindVariableList && vbindVariableList.forEach((vbVar) => {
    code = code.replaceAll(`v-bind-m(${vbVar.value})`, `var(--${vbVar.hash})`)
  })
  return code
}

export function injectCssOnBuild(
  code: string,
  injectCSSContent: Set<{ content: string, lang: string }>,
  descriptor: SFCDescriptor) {
  const cssContent = [...injectCSSContent]
  let resCode = ''
  descriptor.styles && descriptor.styles.forEach((value) => {
    resCode = `${resCode}\n<style lang="${value.lang || 'css'}">${transformInjectCSS(value.content, parseImports(value.content).imports)}</style>`
  })
  cssContent.forEach((value) => {
    resCode = `${resCode}\n<style lang="${value.lang}">${transformInjectCSS(value.content, parseImports(value.content).imports)}</style>`
  })
  code = removeStyleTagsAndContent(code)
  return `${code}\n${resCode}`
}

export function removeStyleTagsAndContent(html: string): string {
  // 使用正则表达式匹配所有的style标签并替换为空字符串
  const newHtml = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  // 使用正则表达式匹配所有的style标签并替换为空字符串
  return newHtml.replace(/<style\b[^>]*>/gi, '').replace(/<\/style>/gi, '')
}
