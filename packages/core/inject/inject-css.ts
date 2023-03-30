import chalk from 'chalk'
import { outputFile } from 'fs-extra'
import type { TMatchVariable } from '../parser'
import type { OutputOptions } from 'rollup'
import type { IBundle } from '../types'
// TODO unit test
export function injectCssOnServer(
  code: string,
  vbindVariableList: TMatchVariable,
) {
  vbindVariableList.forEach((vbVar) => {
    code = code.replaceAll(`v-bind-m(${vbVar.value})`, `var(--${vbVar.hash})`)
  })
  return code
}

export async function injectCssOnBuild(
  options: OutputOptions,
  bundle: IBundle,
  vbindVariableList: TMatchVariable) {
  const taskList = []
  for (const key in bundle) {
    if (bundle[key].type === 'asset') {
      const goRevoke = async() => {
        const fileName = bundle[key].fileName
        const bufferSource = bundle[key].source
        console.log(
          chalk.greenBright.bold('✨ : [unplugin-vue-cssvars] start inject cssvars'),
          chalk.blueBright.bold(`[${fileName}]`))
        console.log(bufferSource)
        // vbindVariableList.forEach()
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
}
