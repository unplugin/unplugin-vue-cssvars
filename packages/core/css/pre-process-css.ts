import * as path from 'path'
import * as csstree from 'css-tree'
import fg from 'fast-glob'
import fs from 'fs-extra'
import { FG_IGNORE_LIST, SUPPORT_FILE_LIST, completeSuffix } from '@unplugin-vue-cssvars/utils'
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
  vBindCode: Record<string, Set<string>> | null,
  vBindEntry: boolean) => {
  // 记录 Rule
  if (node.type === 'Rule')
    vBindPathNode = node
  // 当遍历到 v-bind，标记
  if (node.type === 'Function' && node.name === 'v-bind' && vBindPathNode)
    vBindEntry = true

  // 当遍历到 v-bind，就把之前记录的 Rule node 转化为 css
  if (vBindEntry && vBindPathNode && node.type === 'Identifier' && vBindCode) {
    vBindEntry = false
    if (!vBindCode[node.name])
      vBindCode[node.name] = new Set()

    vBindCode[node.name].add(`\n/* created by @unplugin-vue-cssvars */\n ${csstree.generate(vBindPathNode)}`)
  }

  return { vBindCode: vBindCode || {}, vBindPathNode, vBindEntry }
}
export function walkCSSTree(
  ast: CssNode,
  code: string,
  cb: (
    importer: string,
    vBindCode: Record<string, Set<string>> | null
  ) => void,
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
  let vBindCode: Record<string, Set<string>> | null = null
  let vBindEntry = false
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
        const cssVarsRes = getCSSVarsCode(node, code, vBindPathNode, vBindCode, vBindEntry)
        vBindCode = cssVarsRes.vBindCode
        vBindPathNode = cssVarsRes.vBindPathNode
        vBindEntry = cssVarsRes.vBindEntry
      }
    },
  })
  cb(importerStr, vBindCode)
}
export function preProcessCSS(options: SearchGlobOptions): ICSSFileMap {
  const { rootDir } = options

  // 获得文件列表
  const files = fg.sync(SUPPORT_FILE_LIST, {
    ignore: FG_IGNORE_LIST,
    cwd: rootDir,
  })

  const cssFiles: ICSSFileMap = new Map()
  // ⭐⭐TODO: 读取内容，後綴怎麽處理？
  // ⭐⭐TODO: 同名文件，不同後綴怎麽處理？ 優先級怎麽定？
  // ⭐TODO: 支持 sass
  // ⭐TODO: 支持 less
  for (const file of files) {
    const code = fs.readFileSync(file, { encoding: 'utf-8' })
    const cssAst = csstree.parse(code)
    const absoluteFilePath = path.resolve(path.parse(file).dir, path.parse(file).base)
    if (!cssFiles.get(absoluteFilePath)) {
      cssFiles.set(absoluteFilePath, {
        importer: new Set(),
        vBindCode: null,
      })
    }

    walkCSSTree(cssAst, code, (importer, vBindCode) => {
      const cssF = cssFiles.get(absoluteFilePath)!
      // 设置 importer
      if (importer) {
        const value = completeSuffix(path.resolve(path.parse(file).dir, importer))
        cssF.importer.add(value)
      }
      cssFiles.set(absoluteFilePath, {
        importer: cssF.importer,
        vBindCode,
      })
    })
  }
  return cssFiles
}
