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
  completeSuffix,
  transformSymbol,
} from '@unplugin-vue-cssvars/utils'
import MagicString from 'magic-string'
import { parseImports } from '../parser'
import { transformQuotes } from '../transform/transform-quotes'
import type { ICSSFileMap, PreProcessor, SearchGlobOptions } from '../types'
import type { ImportStatement } from '../parser'

import type { CssNode } from 'css-tree'

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
 */
export function walkCSSTree(
  ast: CssNode,
  cb: (
    vBindCode: Record<string, Set<string>> | null
  ) => void) {
  let vBindPathNode: CssNode | null = null
  let vBindCode: Record<string, Set<string>> | null = null
  let vBindEntry = false
  csstree.walk(ast, {
    enter(node: CssNode) {
      // 根据 css 从它的 ast 中分析生成包含 CSSVars 的代码
      const cssVarsRes = getCSSVarsCode(node, vBindPathNode, vBindCode, vBindEntry)
      vBindCode = cssVarsRes.vBindCode
      vBindPathNode = cssVarsRes.vBindPathNode
      vBindEntry = cssVarsRes.vBindEntry
    },
  })
  cb(vBindCode)
}

/**
 * 预处理css文件
 * @param options 选项参数 Options
 */
export function preProcessCSS(options: SearchGlobOptions): ICSSFileMap {
  const { rootDir, preprocessor, includeCompile } = options

  // 获得文件列表
  const files = fg.sync(includeCompile!, {
    ignore: FG_IGNORE_LIST,
    cwd: rootDir,
  })

  // init cssFiles
  const cssFiles: ICSSFileMap = new Map()
  for (const file of files) {
    let absoluteFilePath = resolve(parse(file).dir, parse(file).base)
    absoluteFilePath = transformSymbol(absoluteFilePath)
    if (!cssFiles.get(absoluteFilePath)) {
      cssFiles.set(absoluteFilePath, {
        importer: new Set(),
        vBindCode: null,
      })
    }
  }
  for (const file of files) {
    const fileDirParse = parse(file)
    const fileSuffix = fileDirParse.ext

    const orgCode = fs.readFileSync(resolve(rootDir!, file), { encoding: 'utf-8' })
    const { imports } = parseImports(orgCode, [transformQuotes])
    const codeNoImporter = getContentNoImporter(orgCode, imports)
    let code = generateCSSCode(codeNoImporter, fileSuffix, preprocessor!)
    code = setImportToCompileRes(code, imports)

    // parse css ast
    const cssAst = csstree.parse(code!)
    const absoluteFilePath = transformSymbol(resolve(fileDirParse.dir, fileDirParse.base))
    imports.forEach((value) => {
      // scss、less、stylus 中规则：scss、less、stylus文件可以引用 css 文件、
      // 以及对应的scss或less文件或stylus文件，对同名文件的css文件和对应的预处理器后缀文件进行转换分析
      // 编译时，如果出现 scss 和 css 同名，只会处理 scss的。其次才处理 css 的
      const cssF = cssFiles.get(absoluteFilePath)!
      // 设置 importer
      const importerPath = resolve(
        fileDirParse.dir,
        value.path.replace(/^"|"$/g, ''))
      // 默认使用 .css
      let importerVal = completeSuffix(importerPath)
      // 如果 file 不是 .css 文件，那么它的 import 需要判断处理
      if (fileSuffix !== `.${SUPPORT_FILE.CSS}`) {
        // 先根据后缀名查找是否存在该文件
        const importerValBySuffix = completeSuffix(
          importerPath,
          fileSuffix.split('.')[1],
        )
        // 存在就使用 fileSuffix 的后缀文件
        if (cssFiles.get(importerValBySuffix))
          importerVal = importerValBySuffix
      }
      cssF.importer.add(importerVal)
    })

    walkCSSTree(cssAst, (vBindCode) => {
      const cssF = cssFiles.get(absoluteFilePath)!
      cssFiles.set(absoluteFilePath, {
        importer: cssF.importer,
        vBindCode,
      })
    })
  }
  return cssFiles
}

export function generateCSSCode(code: string, suffix: string, preprocessor: PreProcessor) {
  let res = ''
  switch (suffix) {
    case `.${SUPPORT_FILE.SCSS}`: // scss
      // @import 有 css 和 scss的同名文件，会编译 scss
      // @import 编译 scss，会一直编译，一直到遇到 import 了一个 css 或没有 import 为止
      // 这里先分析出 imports，在根据其内容将 sass 中 import 删除
      // 编译 sass 为 css，再复原
      if (!preprocessor.sass)
        throw new Error('[unplugin-vue-cssvars]: Missing preprocessor \'sass\' dependency, please see readme to resolve this problem')

      res = preprocessor.sass.compileString(code).css
      break
    case `.${SUPPORT_FILE.SASS}`: // sass
      if (!preprocessor.sass)
        throw new Error('[unplugin-vue-cssvars]: Missing preprocessor \'sass\' dependency, please see readme to resolve this problem')

      res = preprocessor.sass.compileString(code, { syntax: 'indented' }).css
      break
    case `.${SUPPORT_FILE.LESS}`: // less
      if (!preprocessor.less)
        throw new Error('[unplugin-vue-cssvars]: Missing preprocessor \'less\' dependency, please see readme to resolve this problem')

      preprocessor.less.render(code, {}, (error, output) => {
        if (error)
          throw error

        res = output ? output.css : ''
      })
      break
    case `.${SUPPORT_FILE.STYL}`: // stylus
      if (!preprocessor.stylus)
        throw new Error('[unplugin-vue-cssvars]: Missing preprocessor \'stylus\' dependency, please see readme to resolve this problem')

      preprocessor.stylus.render(code, {}, (error: Error, css: string) => {
        if (error)
          throw error

        res = css || ''
      })
      break
    default:
      res = code
  }
  return res
}

export function getContentNoImporter(content: string, parseRes: ImportStatement[]) {
  const mgcStr = new MagicString(content)
  parseRes.forEach((value) => {
    if (value.end !== undefined && value.start !== undefined) {
      if (content[value.end] === ';')
        mgcStr.remove(value.end, value.end + 1)

      mgcStr.remove(value.start, value.end)
      mgcStr.replaceAll('@import', '')
      mgcStr.replaceAll('@use', '')
      mgcStr.replaceAll('@require', '')
    }
  })
  return mgcStr.toString().trimStart()
}

export function setImportToCompileRes(content: string, parseRes: ImportStatement[]) {
  const mgcStr = new MagicString(content)
  parseRes.forEach((value) => {
    if (value.type === 'import' || value.type === 'use' || value.type === 'require')
      mgcStr.prepend(`@import ${value.path};\n`)
  })
  return mgcStr.toString()
}
