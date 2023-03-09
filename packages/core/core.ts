import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse as babelParse } from '@babel/parser'
import { parse } from '@vue/compiler-sfc'
import { walk } from 'estree-walker'
import type { Node } from 'estree-walker'
import type { Identifier, VariableDeclarator } from '@babel/types'
import type { UnpluginOptions } from 'unplugin'
import type { FilterPattern } from '@rollup/pluginutils'
export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
}
const getReactiveVariable = (code: string) => {
  const { descriptor } = parse(code)
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

const unplugin = createUnplugin<Options>(
  (userOptions = {}): UnpluginOptions => {
    const filter = createFilter(userOptions.include, userOptions.exclude)
    return {
      name: NAME,
      enforce: 'pre',
      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        try {
          console.log('transform ########################################################')
          if (id.endsWith('.vue')) {
            // TODO 1.根据组件引用，生成 css module 依赖图
            // 2.根据组件获取响变量
            const variableName = getReactiveVariable(code)
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
