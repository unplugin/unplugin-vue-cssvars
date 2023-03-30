import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse } from '@vue/compiler-sfc'
import { preProcessCSS } from './runtime/pre-process-css'
import { getVBindVariableListByPath } from './runtime/process-css'
import { initOption } from './option'
import { getVariable, matchVariable } from './parser'
import { injectCSSVars } from './inject/inject-cssvars'
import { injectCssOnServer } from './inject/inject-css-hash'
import type { TMatchVariable } from './parser'
import type { IBundle, Options } from './types'

import type { OutputOptions } from 'rollup'

const unplugin = createUnplugin<Options>(
  (options: Options = {}): any => {
    const userOptions = initOption(options)
    const filter = createFilter(
      userOptions.include,
      userOptions.exclude,
    )
    // 预处理 css 文件
    const CSSFileModuleMap = preProcessCSS(userOptions)
    let vbindVariableList: TMatchVariable = []
    let curSFCScopeId = ''
    let isScriptSetup = false
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
              const { descriptor } = parse(code)
              isScriptSetup = !!descriptor.scriptSetup
              const vbindVariableListByPath = getVBindVariableListByPath(descriptor, id, CSSFileModuleMap)
              const variableName = getVariable(descriptor)
              vbindVariableList = matchVariable(vbindVariableListByPath, variableName)
            }
            return code
          } catch (err: unknown) {
            this.error(`${NAME} ${err}`)
          }
        },
      },
      {
        name: `${NAME}:inject`,
        enforce: 'post',
        async transform(code: string, id: string) {
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
          try {
            // transform in dev
            if (userOptions.dev) {
              if (id.endsWith('.vue')) {
                const injectRes = injectCSSVars(code, vbindVariableList, isScriptSetup, userOptions.dev)
                code = injectRes.code
                vbindVariableList = injectRes.vbindVariableList
              }
              if (id.endsWith('.scss'))
                code = injectCssOnServer(code, vbindVariableList)
            } else {
              console.log(id)
              // TODO: transform in build
              if (id.endsWith('.vue'))
                curSFCScopeId = code.substring(code.length - 6)

              if (id.includes('setup=true')) {
                const injectRes = injectCSSVars(code, vbindVariableList, isScriptSetup)
                code = injectRes.code
                vbindVariableList = injectRes.vbindVariableList
              }
            }

            return code
          } catch (err: unknown) {
            this.error(`${NAME} ${err}`)
          }
        },
        async writeBundle(options: OutputOptions, bundle: IBundle) {
          // TODO: just only run in build
          console.log(bundle)
          /* // 改写 css
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
          await Promise.all(taskList) */
        },
      },
    ]
  })

export const viteVueCSSVars = unplugin.vite
export const rollupVueCSSVars = unplugin.rollup
export const webpackVueCSSVars = unplugin.webpack
export const esbuildVueCSSVars = unplugin.esbuild
