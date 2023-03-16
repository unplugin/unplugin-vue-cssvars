import path from 'path'
import * as csstree from 'css-tree'
import { completeSuffix } from '@unplugin-vue-cssvars/utils'
import { walkCSSTree } from './pre-process-css'
import type { ICSSFile, ICSSFileMap } from '../types'
import type { SFCDescriptor } from '@vue/compiler-sfc'

export const getCSSFileRecursion = (key: string, cssFiles: ICSSFileMap, cb: (res: ICSSFile) => void, matchedMark = new Set<string>()) => {
  // 避免循环引用
  if (matchedMark.has(key)) return
  const cssFile = cssFiles.get(key)
  if (cssFile) {
    matchedMark.add(key)
    cb(cssFile)
    if (cssFile.importer.size > 0) {
      cssFile.importer.forEach((value) => {
        getCSSFileRecursion(value, cssFiles, cb, matchedMark)
      })
    }
  }
}

/**
 * 遍历 sfc 的 style 标签内容
 * 根据其 ast，获取 @import 信息
 * @param descriptor
 * @param id transform's id
 * @param cssFiles
 */
export const createCSSModule = (descriptor: SFCDescriptor, id: string, cssFiles: ICSSFileMap) => {
  const importModule: Array<ICSSFile> = []
  // 遍历 sfc 的 style 标签内容
  for (let i = 0; i < descriptor.styles.length; i++) {
    const content = descriptor.styles[i].content
    const cssAst = csstree.parse(content)
    // 根据其 ast，获取 @import 信息
    walkCSSTree(cssAst, content, (importer) => {
      // 添加后缀
      const key = completeSuffix(path.resolve(path.parse(id).dir, importer))
      // 根据 @import 信息，从 cssFiles 中，递归的获取所有在预处理时生成的 cssvars 样式
      getCSSFileRecursion(key, cssFiles, (res: ICSSFile) => {
        importModule.push(res)
      })
    }, { i: true, v: false })
  }
  return importModule
}
