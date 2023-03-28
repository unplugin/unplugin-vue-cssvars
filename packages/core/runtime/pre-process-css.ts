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
import MagicString from 'magic-string'
import sass from 'sass'
import less from 'less'
import stylus from 'stylus'
import { parseImports } from '../parser/parser-import'
import { transformQuotes } from '../transform/transform-quotes'
import type { ImportStatement } from '../parser/parser-import'
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
    const fileSuffix = parse(file).ext
    const code = generateCSSCode(resolve(rootDir!, file), fileSuffix)
    // parse css ast
    const cssAst = csstree.parse(code!)
    let absoluteFilePath = resolve(parse(file).dir, parse(file).base)
    absoluteFilePath = transformSymbol(absoluteFilePath)
    walkCSSTree(cssAst, (importer, vBindCode) => {
      // scss、less、stylus 中规则：scss、less、stylus文件可以引用 css 文件、
      // 以及对应的scss或less文件或stylus文件，对同名文件的css文件和对应的预处理器后缀文件进行转换分析
      // 编译时，如果出现 scss 和 css 同名，只会处理 scss的。其次才处理 css 的
      const cssF = cssFiles.get(absoluteFilePath)!
      // 设置 importer
      if (importer) {
        let importerVal = ''
        // 如果 file 不是 .css 文件，那么它的 import 需要判断处理
        if (fileSuffix !== `.${SUPPORT_FILE.CSS}`) {
          // 先根据后缀名查找是否存在该文件
          importerVal = completeSuffix(transformSymbol(resolve(parse(file).dir, importer)), fileSuffix.split('.')[1])
          // 不存在就使用 css 的后缀文件
          if (!cssFiles.get(importerVal))
            importerVal = completeSuffix(transformSymbol(resolve(parse(file).dir, importer)))
        } else {
          importerVal = completeSuffix(transformSymbol(resolve(parse(file).dir, importer)))
        }
        cssF.importer.add(importerVal)
      }
      cssFiles.set(absoluteFilePath, {
        importer: cssF.importer,
        vBindCode,
      })
    })
  }
  return cssFiles
}

// TODO 可以优化, 预编译会导致速度变慢
export function generateCSSCode(path: string, suffix: string) {
  const code = fs.readFileSync(path, { encoding: 'utf-8' })
  let res = ''
  switch (suffix) {
    case `.${SUPPORT_FILE.SCSS}`: // scss
      // @import 有 css 和 scss的同名文件，会编译 scss
      // @import 编译 scss，会一直编译，一直到遇到 import 了一个 css 或没有 import 为止
      // 这里先分析出 imports，在根据其内容将 sass 中 import 删除
      // 编译 sass 为 css，再复原
      // eslint-disable-next-line no-case-declarations
      const parseScssImporter = parseImports(code, [transformQuotes])
      // eslint-disable-next-line no-case-declarations
      const codeScssNoImporter = getCurFileContent(code, parseScssImporter.imports)
      // eslint-disable-next-line no-case-declarations
      const scssParseRes = sass.compileString(codeScssNoImporter)
      res = setImportToCompileRes(scssParseRes.css, parseScssImporter.imports)
      break
    case `.${SUPPORT_FILE.SASS}`: // sass
      // eslint-disable-next-line no-case-declarations
      const parseSassImporter = parseImports(code, [transformQuotes])
      // eslint-disable-next-line no-case-declarations
      const codeNoImporter = getCurFileContent(code, parseSassImporter.imports)
      // eslint-disable-next-line no-case-declarations
      const sassParseRes = sass.compileString(codeNoImporter, { syntax: 'indented' })
      res = setImportToCompileRes(sassParseRes.css, parseSassImporter.imports)
      break
    case `.${SUPPORT_FILE.LESS}`: // less
      // eslint-disable-next-line no-case-declarations
      const parseLessImporter = parseImports(code, [transformQuotes])
      // eslint-disable-next-line no-case-declarations
      const codeLessNoImporter = getCurFileContent(code, parseLessImporter.imports)
      less.render(codeLessNoImporter, {}, (error, output) => {
        if (error)
          throw error

        res = output ? setImportToCompileRes(output.css, parseLessImporter.imports) : ''
      })
      break
    case `.${SUPPORT_FILE.STYL}`: // stylus
      // eslint-disable-next-line no-case-declarations
      const parseStylusImporter = parseImports(code, [transformQuotes])
      // eslint-disable-next-line no-case-declarations
      const codeStylusNoImporter = getCurFileContent(code, parseStylusImporter.imports)
      stylus.render(codeStylusNoImporter, {}, (error: Error, css: string) => {
        if (error)
          throw error

        res = css ? setImportToCompileRes(css, parseStylusImporter.imports) : ''
      })
      break
    default:
      res = code
      // css中规则：css文件只能引用 css 文件
  }
  return res
}

export function getCurFileContent(content: string, parseRes: ImportStatement[]) {
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
