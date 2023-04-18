import { parse, resolve } from 'path'
import fg from 'fast-glob'
import fs from 'fs-extra'
import {
  FG_IGNORE_LIST,
  SUPPORT_FILE,
  completeSuffix,
  transformSymbol,
} from '@unplugin-vue-cssvars/utils'
import { parseImports, parseVBindM } from '../parser'
import { transformQuotes } from '../transform/transform-quotes'
import { handleAlias } from './process-css'
import type { ICSSFileMap, SearchGlobOptions } from '../types'

/**
 * 预处理css文件
 * @param options 选项参数 Options
 * @param alias
 * @param filesPath
 */
export function preProcessCSS(
  options: SearchGlobOptions,
  alias?: Record<string, string>,
  filesPath?: string[]): ICSSFileMap {
  const { rootDir, includeCompile } = options
  // 获得文件列表
  const files = filesPath || getAllCSSFilePath(includeCompile!, rootDir!)

  return createCSSFileModuleMap(files, rootDir!, alias)
}

export function getAllCSSFilePath(includeCompile: string[], rootDir: string) {
  return fg.sync(includeCompile!, {
    ignore: FG_IGNORE_LIST,
    cwd: rootDir,
  })
}

// TODO: unit test
export function createCSSFileModuleMap(files: string[], rootDir: string, alias?: Record<string, string>) {
  const cssFiles: ICSSFileMap = new Map()
  for (const file of files) {
    let absoluteFilePath = resolve(parse(file).dir, parse(file).base)
    absoluteFilePath = transformSymbol(absoluteFilePath)
    if (!cssFiles.get(absoluteFilePath)) {
      cssFiles.set(absoluteFilePath, {
        importer: new Set(),
        vBindCode: [],
        content: '',
        lang: 'css',
      })
    }
  }

  for (const file of files) {
    const fileDirParse = parse(file)
    const fileSuffix = fileDirParse.ext

    const code = fs.readFileSync(transformSymbol(resolve(rootDir!, file)), { encoding: 'utf-8' })
    const { imports } = parseImports(code, [transformQuotes])

    const absoluteFilePath = transformSymbol(resolve(fileDirParse.dir, fileDirParse.base))
    // scss、less、stylus 中规则：scss、less、stylus文件可以引用 css 文件、
    // 以及对应的scss或less文件或stylus文件，对同名文件的css文件和对应的预处理器后缀文件进行转换分析
    // 编译时，如果出现 scss 和 css 同名，只会处理 scss的。其次才处理 css 的
    const cssF = cssFiles.get(absoluteFilePath)!

    imports.forEach((value) => {
      // 设置 importer
      const importerPath = handleAlias(value.path.replace(/^"|"$/g, ''), alias, fileDirParse.dir)
      // 默认使用 .css
      let importerVal = completeSuffix(importerPath, SUPPORT_FILE.CSS)
      // 如果 file 不是 .css 文件，那么它的 import 需要判断处理
      if (fileSuffix !== `.${SUPPORT_FILE.CSS}`) {
        // 根据后缀名查找是否存在该文件
        const importerValBySuffix = completeSuffix(
          importerPath,
          fileSuffix.split('.')[1],
          true,
        )
        // 存在就使用 fileSuffix 的后缀文件
        if (cssFiles.get(importerValBySuffix))
          importerVal = importerValBySuffix
      }
      cssF.importer.add(importerVal)
    })
    cssF.vBindCode = parseVBindM(code)
    cssF.content = code
    cssF.lang = fileSuffix.replaceAll('.', '')
    cssFiles.set(absoluteFilePath, cssF)
  }
  return cssFiles
}
