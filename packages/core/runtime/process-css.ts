import { parse, resolve } from 'path'
import { SUPPORT_FILE, completeSuffix, setTArray } from '@unplugin-vue-cssvars/utils'
import { parseImports } from '../parser'
import type { ICSSFile, ICSSFileMap } from '../types'
import type { SFCDescriptor } from '@vue/compiler-sfc'

export const getCSSFileRecursion = (
  lang: string = SUPPORT_FILE.CSS,
  key: string,
  cssFiles: ICSSFileMap,
  cb: (res: ICSSFile) => void,
  matchedMark = new Set<string>()) => {
  // 添加后缀
  // sfc中规则：如果@import 指定了后缀，则根据后缀，否则根据当前 script 标签的 lang 属性（默认css）
  key = completeSuffix(key, lang)
  // 如果 .scss 的 import 不存在，则用 css 的
  if (!cssFiles.get(key))
    key = completeSuffix(key, SUPPORT_FILE.CSS, true)

  // 避免循环引用
  if (matchedMark.has(key)) return
  const cssFile = cssFiles.get(key)
  if (cssFile) {
    matchedMark.add(key)
    cb(cssFile)
    if (cssFile.importer.size > 0) {
      cssFile.importer.forEach((value) => {
        getCSSFileRecursion(lang, value, cssFiles, cb, matchedMark)
      })
    }
  } else {
    throw new Error(`The writing of the path '${key}' is not standardized or undefined, which may cause \`v-bind-m\` to fail to take effect`)
  }
}

/**
 * 遍历 sfc 的 style 标签内容
 * 根据其 ast，获取 @import 信息
 * @param descriptor
 * @param id transform's id
 * @param cssFiles
 * @param server
 */
// TODO: unit test
export type TInjectCSSContent = Set<{ content: string, lang: string, styleTagIndex: number }>
export const getVBindVariableListByPath = (
  descriptor: SFCDescriptor,
  id: string,
  cssFiles: ICSSFileMap,
  server: boolean) => {
  const vbindVariable: Set<string> = new Set()
  const injectCSSContent: TInjectCSSContent = new Set()
  // 遍历 sfc 的 style 标签内容
  for (let i = 0; i < descriptor.styles.length; i++) {
    const content = descriptor.styles[i].content
    const lang = descriptor.styles[i].lang === SUPPORT_FILE.STYLUS ? SUPPORT_FILE.STYL : descriptor.styles[i].lang
    const idDirParse = parse(id)
    const parseImporterRes = parseImports(content)
    parseImporterRes.imports.forEach((res) => {
      const importerPath = resolve(idDirParse.dir, res.path)

      // 根据 @import 信息，从 cssFiles 中，递归的获取所有在预处理时生成的 cssvars 样式
      getCSSFileRecursion(lang, importerPath, cssFiles, (res: ICSSFile) => {
        if (res.vBindCode) {
          !server && injectCSSContent.add({ content: res.content, lang: res.lang, styleTagIndex: i })
          res.vBindCode.forEach((vb) => {
            vbindVariable.add(vb)
          })
        }
      })
    })
  }
  return {
    vbindVariableListByPath: setTArray(vbindVariable),
    injectCSSContent,
  }
}
