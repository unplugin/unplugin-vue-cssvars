import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse as babelParse } from '@babel/parser'
import { parse } from '@vue/compiler-sfc'
import { walk } from 'estree-walker'
import type { UnpluginOptions } from 'unplugin'
import type { FilterPattern } from '@rollup/pluginutils'
export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
}
const getReactiveVariable = (code: string, id: string) => {
  const { descriptor } = parse(code)
  const ast = babelParse(descriptor.scriptSetup.content, {
    sourceType: 'module',
    plugins: ['typescript'],
  })
  walk(ast, {
    enter(node, parent, prop, index) {
      debugger
    }
  })
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
        // 1.根据组件引用，生成 css module 依赖图
        // 2.根据组件获取响应式变量
        // 3.根据依赖图内容 和 当前组件响应式变量，转换代码到组件源码中
        try {
          console.log('transform ########################################################')
          if (id.endsWith('.vue'))
            getReactiveVariable(code, id)
            /* code = code.replace('</style>', '.tests  {\n'
               + '    color: v-bind(color);\n'
               + '}</style>') */

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
