import path from 'path'
import * as csstree from 'css-tree'
import { completeSuffix } from '@unplugin-vue-cssvars/utils'
import { walkCSSTree } from './pre-process-css'
import type { ICSSFile, ICSSFileMap } from '../types'
import type { SFCDescriptor } from '@vue/compiler-sfc'

export const createCSSModule = (descriptor: SFCDescriptor, id: string, cssFiles: ICSSFileMap) => {
  const importModule: Array<ICSSFile> = []
  for (let i = 0; i < descriptor.styles.length; i++) {
    const content = descriptor.styles[i].content
    const cssAst = csstree.parse(content)

    walkCSSTree(cssAst, content, (importer) => {
      const key = completeSuffix(path.resolve(path.parse(id).dir, importer))
      const cssFile = cssFiles.get(key)
      cssFile && importModule.push(cssFile)
    }, { i: true, v: false })
  }
  return importModule
}
