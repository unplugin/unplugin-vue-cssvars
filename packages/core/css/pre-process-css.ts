import { parse, resolve } from 'path'
import * as csstree from 'css-tree'
import fg from 'fast-glob'
import fs from 'fs-extra'
import {
  FG_IGNORE_LIST,
  INJECT_FLAG,
  INJECT_PREFIX_FLAG,
  INJECT_SUFFIX_FLAG,
  SUPPORT_FILE,
  SUPPORT_FILE_LIST,
  completeSuffix,
  transformSymbol,
} from '@unplugin-vue-cssvars/utils'
import type { ICSSFileMap, SearchGlobOptions } from '../types'

import type { CssNode } from 'css-tree'

/**
 * 遍历 css 的 ast，返回 @import 内容
 * @param node css 的 ast 节点
 * @param isAtrule 是否进入到 atrule
 * @param isAtrulePrelude 是否进入到 AtrulePrelude
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
 * @param node css 的 ast 节点
 * @param vBindPathNode vbind的节点路径上的 node，用于生成 css
 * @param vBindCode Record<string, Set<string>>
 * key是vbind变量名，值是key对应的css代码字符串set
 * @param vBindEntry 标记是否进入到了包含 vbind的 节点
 */
export const getCSSVarsCode = (
  node: CssNode,
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

    const injectCSS = `${INJECT_FLAG}${INJECT_PREFIX_FLAG}${csstree.generate(vBindPathNode)}${INJECT_SUFFIX_FLAG}`
    vBindCode[node.name].add(injectCSS)
  }

  return { vBindCode: vBindCode || {}, vBindPathNode, vBindEntry }
}

/**
 * 遍历css树
 * @param ast css的ast
 * @param cb 回调函数
 * @param helper 辅助函数标识
 * i 表示分析@import语句，v表示分析生成包含 cssvar 的代码
 */
export function walkCSSTree(
  ast: CssNode,
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
        const cssVarsRes = getCSSVarsCode(node, vBindPathNode, vBindCode, vBindEntry)
        vBindCode = cssVarsRes.vBindCode
        vBindPathNode = cssVarsRes.vBindPathNode
        vBindEntry = cssVarsRes.vBindEntry
      }
    },
  })
  cb(importerStr, vBindCode)
}

/**
 * 预处理css文件
 * @param options 选项参数 Options
 */
export function preProcessCSS(options: SearchGlobOptions): ICSSFileMap {
  const { rootDir } = options

  // 获得文件列表
  const files = fg.sync(SUPPORT_FILE_LIST, {
    ignore: FG_IGNORE_LIST,
    cwd: rootDir,
  })

  const cssFiles: ICSSFileMap = new Map()

  for (const file of files) {
    const code = fs.readFileSync(resolve(rootDir!, file), { encoding: 'utf-8' })
    // parse css ast
    // css中规则：css文件只能引用 css 文件
    if (file.endsWith(`.${SUPPORT_FILE.CSS}`)) {
      const cssAst = csstree.parse(code)
      let absoluteFilePath = resolve(parse(file).dir, parse(file).base)
      absoluteFilePath = transformSymbol(absoluteFilePath)
      if (!cssFiles.get(absoluteFilePath)) {
        cssFiles.set(absoluteFilePath, {
          importer: new Set(),
          vBindCode: null,
        })
      }

      walkCSSTree(cssAst, (importer, vBindCode) => {
        const cssF = cssFiles.get(absoluteFilePath)!
        // 设置 importer
        if (importer) {
          const value = completeSuffix(transformSymbol(resolve(parse(file).dir, importer)))
          cssF.importer.add(value)
        }
        cssFiles.set(absoluteFilePath, {
          importer: cssF.importer,
          vBindCode,
        })
      })
    }
    // scss、less、stylus 中规则：scss、less、stylus文件可以引用 css 文件、
    // 以及对应的scss或less文件或stylus文件，则对同名文件的css文件和对应的预处理器后缀文件进行转换分析
    // ⭐⭐TODO: 读取内容，後綴怎麽處理？
    // ⭐TODO: 同名文件，不同後綴怎麽處理？ 優先級怎麽定？

    // ⭐TODO: 支持 scss
    // if (file.endsWith(`.${SUPPORT_FILE.SASS}`)) { /* empty */ }

    // ⭐TODO: 支持 sass
    // if (file.endsWith(`.${SUPPORT_FILE.SASS}`)) { /* empty */ }

    // ⭐TODO: 支持 less
    // if (file.endsWith(`.${SUPPORT_FILE.LESS}`)) { /* empty */ }

    // ⭐TODO: 支持 stylus
    // if (file.endsWith(`.${SUPPORT_FILE.STYLUS}`)) { /* empty */ }
  }
  return cssFiles
}
