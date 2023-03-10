import * as path from 'path'
import { createUnplugin } from 'unplugin'
import { NAME, completeSuffix } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse as babelParse } from '@babel/parser'
import { parse } from '@vue/compiler-sfc'
import { walk } from 'estree-walker'
import * as csstree from 'css-tree'
import fs from 'fs-extra'
import { preProcessCSS } from './pre-process-css'
import type { SFCDescriptor } from '@vue/compiler-sfc'
import type { Node } from 'estree-walker'
import type { Identifier, VariableDeclarator } from '@babel/types'
import type { UnpluginOptions } from 'unplugin'
import type { FilterPattern } from '@rollup/pluginutils'
export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
}

/**
 * 获取变量
 * @param descriptor
 */
const getVariable = (descriptor: SFCDescriptor) => {
  // TODO: setup script
  // TODO: options
  // TODO: setup composition
  const ast = babelParse(descriptor.scriptSetup.content, {
    sourceType: 'module',
    plugins: ['typescript'],
  })
  const variableName = {} as Record<string, Identifier>
  (walk as any)(ast, {
    enter(node: Node & { scopeIds?: Set<string> }, parent: Node | undefined) {
      if (parent && parent.type === 'Program' && node.type === 'VariableDeclaration') {
        const declarations = node.declarations as Array<VariableDeclarator>
        declarations.forEach((declare) => {
          const identifier = declare.id as Identifier
          variableName[identifier.name] = identifier
        })
      }
    },
  })
  return variableName
}

/* const getImportCSS = async(descriptor: SFCDescriptor, id: string) => {
  const importList = []

  const walkCSSAst = async(ast, containPath) => {
    let isAtrule = false
    let isAtrulePrelude = false
    await csstree.walk(ast, {
      async enter(node, item, list) {
        if (node.type === 'Atrule' && node.name === 'import')
          isAtrule = true

        if (node.type === 'AtrulePrelude' && isAtrule)
          isAtrulePrelude = true

        if (node.type === 'String' && isAtrule && isAtrulePrelude) {
          isAtrule = false
          isAtrulePrelude = false
          // TODO: 读取内容，後綴怎麽處理？
          // TODO: 同名文件，不同後綴怎麽處理？ 優先級怎麽定？
          const value = completeSuffix(path.resolve(path.parse(containPath).dir, node.value))
          importList.push(value)
          // TODO: 读取内容
          const res = await fs.readFile(value)
          // TODO: 递归遍历内容
          debugger
          await walkCSSAst(csstree.parse(res.toString()), value)
        }
      },
    })
  }
  for (let i = 0; i < descriptor.styles.length; i++) {
    const content = descriptor.styles[i].content
    const cssAst = csstree.parse(content)
    await walkCSSAst(cssAst, id)
  }
  return importList
} */

const getImportCSS = (descriptor: SFCDescriptor, id: string) => {
  console.log(descriptor, id)
  return preProcessCSS(id)
}
const unplugin = createUnplugin<Options>(
  (userOptions = {}): UnpluginOptions => {
    const filter = createFilter(userOptions.include, userOptions.exclude)
    return {
      name: NAME,
      enforce: 'pre',

      transformInclude(id) {
        return filter(id)
      },

      async transform(code, id) {
        try {
          console.log('transform ########################################################')
          if (id.endsWith('.vue')) {
            const { descriptor } = parse(code)
            // TODO 1.根据组件引用，生成 css module 依赖图
            const importCSSModule = getImportCSS(descriptor, id)
            console.log(importCSSModule)
            // 2.根据组件获取响变量
            const variableName = getVariable(descriptor)
            console.log(variableName)
            // TODO 3.根据依赖图内容和当前组件响应式变量，转换代码到组件源码中
          }
          return code
        } catch (err: unknown) {
          this.error(`${name} ${err}`)
        }
      },
    }
  })

export const viteVueCSSVars = unplugin.vite
export const rollupVueCSSVars = unplugin.rollup
export const webpackVueCSSVars = unplugin.webpack
export const esbuildVueCSSVars = unplugin.esbuild
