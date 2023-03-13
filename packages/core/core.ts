import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse } from '@vue/compiler-sfc'
import { createCSSModule, preProcessCSS } from './pre-process-css'
import { initOption } from './option'
import { getVariable } from './get-variable'
import type { UnpluginOptions } from 'unplugin'
import type { Options } from './types'

const unplugin = createUnplugin<Options>(
  (options: Options): UnpluginOptions => {
    const userOptions = initOption(options)
    const filter = createFilter(
      userOptions.include,
      userOptions.exclude,
    )
    // 预处理 css 文件
    const preProcessCSSRes = preProcessCSS(userOptions)
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
            const importCSSModule = createCSSModule(descriptor, id, preProcessCSSRes)
            // console.log(importCSSModule)
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
