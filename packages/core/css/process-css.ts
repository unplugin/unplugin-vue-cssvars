import path from 'path'
import * as csstree from 'css-tree'
import { completeSuffix } from '@unplugin-vue-cssvars/utils'
import { walkCSSTree } from './pre-process-css'
import type { ICSSFile, ICSSFileMap } from '../types'
import type { SFCDescriptor } from '@vue/compiler-sfc'

const getCSSFileRecursion = (key: string, cssFiles: ICSSFileMap, cb: (res: ICSSFile) => void) => {
  const cssFile = cssFiles.get(key)
  if (cssFile) {
    cb(cssFile)
    if (cssFile.importer.size > 0) {
      cssFile.importer.forEach((value) => {
        getCSSFileRecursion(value, cssFiles, cb)
      })
    }
  }
}

export const createCSSModule = (descriptor: SFCDescriptor, id: string, cssFiles: ICSSFileMap) => {
  const importModule: Array<ICSSFile> = []
  for (let i = 0; i < descriptor.styles.length; i++) {
    const content = descriptor.styles[i].content
    const cssAst = csstree.parse(content)

    walkCSSTree(cssAst, content, (importer) => {
      const key = completeSuffix(path.resolve(path.parse(id).dir, importer))
      getCSSFileRecursion(key, cssFiles, (res: ICSSFile) => {
        importModule.push(res)
      })
    }, { i: true, v: false })
  }
  debugger
  return importModule
}
