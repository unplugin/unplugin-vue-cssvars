import * as path from 'path'
import * as csstree from 'css-tree'
import fg from 'fast-glob'
import fs from 'fs-extra'
import { completeSuffix } from '@unplugin-vue-cssvars/utils'
import type { ICSSFileMap, SearchGlobOptions } from '../types'

import type { CssNode } from 'css-tree'

/**
 * 遍历 css 的 ast，返回 @import 内容
 */
export const getCSSImport = (
  node: CssNode,
  isAtrule: boolean,
  isAtrulePrelude: boolean) => {
  if (node.type === 'String' && isAtrule && isAtrulePrelude) {
    return {
      value: node.value,
      isAtrule: false,
      isAtrulePrelude: false,
    }
  }

  if (node.type === 'Atrule' && node.name === 'import')
    isAtrule = true

  if (node.type === 'AtrulePrelude' && isAtrule)
    isAtrulePrelude = true

  return {
    value: '',
    isAtrule,
    isAtrulePrelude,
  }
}

/**
 * 根据 css 从它的 ast 中分析生成包含 CSSVars 的代码
 */
export const getCSSVarsCode = (
  node: CssNode,
  code: string,
  vBindPathNode: CssNode | null,
  vBindCode: string) => {
  // 记录 Rule
  if (node.type === 'Rule')
    vBindPathNode = node
  // 当遍历到 v-bind，就把之前记录的 Rule node 转化为 css
  if (node.type === 'Function' && node.name === 'v-bind' && vBindPathNode)
    vBindCode = `${vBindCode}\n/* create by @unplugin-vue-cssvars */ ${csstree.generate(vBindPathNode)}`

  return { vBindCode, vBindPathNode }
}
export function walkCSSTree(
  ast: CssNode,
  code: string,
  cb: (importer: string, vBindCode: string) => void,
  helper: {
    i: boolean
    v: boolean
  } = {
    i: true,
    v: true,
  }) {
  let isAtrule = false
  let isAtrulePrelude = false
  let importerStr: string | undefined = ''
  let vBindPathNode: CssNode | null = null
  let vBindCode = ''
  csstree.walk(ast, {
    enter(node: CssNode) {
      // 根据 css 从它的 ast 中分析并返回 @import 内容
      if (helper.i) {
        const importerRes = getCSSImport(node, isAtrule, isAtrulePrelude)
        isAtrule = importerRes.isAtrule
        isAtrulePrelude = importerRes.isAtrulePrelude
        if (importerRes.value)
          importerStr = importerRes.value
      }

      if (helper.v) {
        // 根据 css 从它的 ast 中分析生成包含 CSSVars 的代码
        const cssVarsRes = getCSSVarsCode(node, code, vBindPathNode, vBindCode)
        vBindCode = cssVarsRes.vBindCode
        vBindPathNode = cssVarsRes.vBindPathNode
      }
    },
  })
  cb(importerStr, vBindCode)
}
export function preProcessCSS(options: SearchGlobOptions): ICSSFileMap {
  const { rootDir } = options

  // 获得文件列表
  const files = fg.sync(['**/**.css'], {
    ignore: ['node_modules', 'dist', '.git'],
    cwd: rootDir,
  })

  const cssFiles: ICSSFileMap = new Map()
  // TODO: 读取内容，後綴怎麽處理？
  // TODO: 同名文件，不同後綴怎麽處理？ 優先級怎麽定？
  for (const file of files) {
    const code = fs.readFileSync(file, { encoding: 'utf-8' })
    const cssAst = csstree.parse(code)
    const absoluteFilePath = path.resolve(path.parse(file).dir, path.parse(file).base)
    // 创建当前文件以及引用关系
    // e.g: { 'xxx/xxx/test.css': {
    //     importer: ['xxx/xxx/test2.css'],
    //     vBindCode: '',
    //   }
    // }
    if (!cssFiles.get(absoluteFilePath)) {
      cssFiles.set(absoluteFilePath, {
        importer: new Set(),
        vBindCode: '',
      })
    }

    walkCSSTree(cssAst, code, (importer, vBindCode) => {
      // 设置 importer
      const value = completeSuffix(path.resolve(path.parse(file).dir, importer))
      const cssF = cssFiles.get(absoluteFilePath)!
      cssF.importer.add(value)
      cssFiles.set(absoluteFilePath, {
        importer: cssF.importer,
        vBindCode,
      })
    })
  }
  return cssFiles
}
