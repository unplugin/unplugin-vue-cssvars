import { createUnplugin } from 'unplugin'
import { INJECT_FLAG, NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse } from '@vue/compiler-sfc'
import { outputFile } from 'fs-extra'
import chalk from 'chalk'
import MagicString from 'magic-string'
import { preProcessCSS } from './runtime/pre-process-css'
import { createCSSModule } from './runtime/process-css'
import { initOption } from './option'
import { getVariable } from './parser'
import { injectCSSVars } from './inject/inject-cssvars'
import { deleteInjectCSS, findInjects, removeInjectImporter, revokeCSSVars } from './inject/revoke-cssvars'
import type { IBundle, Options } from './types'

import type { OutputOptions } from 'rollup'

const unplugin = createUnplugin<Options>(
  (options: Options = {}): any => {
    const userOptions = initOption(options)
    const filter = createFilter(
      userOptions.include,
      userOptions.exclude,
    )
    const curSFCScopeId = new Set()
    // 预处理 css 文件
    const preProcessCSSRes = preProcessCSS(userOptions)
    debugger
    return [
      {
        name: NAME,
        enforce: 'pre',

        transformInclude(id: string) {
          return filter(id)
        },

        async transform(code: string, id: string) {
          try {
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
            if (id.endsWith('.vue')) {
              // const { descriptor } = parse(code)
              // const importCSSModule = createCSSModule(descriptor, id, preProcessCSSRes)
              // const variableName = getVariable(descriptor)
              // code = injectCSSVars(code, importCSSModule, variableName)
              // console.log(code)
            }
            return code
          } catch (err: unknown) {
            this.error(`${NAME} ${err}`)
          }
        },
      },
      /* {
        name: `${NAME}:inject`,
        enforce: 'post',
        transformInclude(id: string) {
          return filter(id)
        },

        async transform(code: string, id: string) {
          try {
            // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
            if (id.endsWith('.vue')){
              curSFCScopeId ='9844404d'
            }
            // 注入 useCssVars
            if(id.includes('setup=true')){
              code = code.replaceAll(`setup(__props) {`, `setup(__props) {
              useCssVars((_ctx) => ({ "c8b0f7e8": unref(fooColor) }));
              `)
              code = code.replaceAll(`export default /!* @__PURE__ *!/`,
                `import { useCssVars, unref } from 'vue'\n export default /!* @__PURE__ *!/`)
              console.log(code)
            }

            return code
          } catch (err: unknown) {
            this.error(`${NAME} ${err}`)
          }
        },
        async writeBundle(options: OutputOptions, bundle: IBundle) {
          // 改写 css
          const taskList = []
            for (const key in bundle) {
              if (bundle[key].type === 'asset') {
                const goRevoke = async() => {
                  const fileName = bundle[key].fileName
                  let bufferSource = bundle[key].source
                  console.log(
                    chalk.greenBright.bold('✨ : [unplugin-vue-cssvars] start revoke'),
                    chalk.blueBright.bold(`[${fileName}]`))

                  // 删除注入内容

                  bufferSource = (bufferSource as string).replaceAll('v-bind-m(fooColor)', 'var(--c8b0f7e8);')
                  // 写入
                  await outputFile(`${options.dir}/${fileName}`, bufferSource)
                }
                const task = new Promise((resolve) => {
                  resolve(goRevoke())
                })
                taskList.push(task)
              }
            }
          await Promise.all(taskList)
        },
      }, */
    ]
  })

export const viteVueCSSVars = unplugin.vite
export const rollupVueCSSVars = unplugin.rollup
export const webpackVueCSSVars = unplugin.webpack
export const esbuildVueCSSVars = unplugin.esbuild
