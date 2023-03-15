import chalk from 'chalk'
import MagicString from 'magic-string'
import { INJECT_FLAG } from '@unplugin-vue-cssvars/utils'
import { outputFile } from 'fs-extra'
import type { OutputOptions } from 'rollup'
import type { IBundle, InjectStr } from '../types'

export async function revokeCSSVars(options: OutputOptions, bundle: IBundle) {
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
        const mgcString = new MagicString(bufferSource as string)
        const injectContents = findInjects(bufferSource as string)
        bufferSource = deleteInjectCSS(injectContents, mgcString)
        bufferSource = bufferSource.replaceAll(INJECT_FLAG, '')
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

export function findInjects(str: string): InjectStr {
  const regex = /\/\*\s?<inject start>\s?\*\/([\s\S]*?)\/\*\s?<inject end>\s?\*\//g
  const matches = []
  let match
  while ((match = regex.exec(str)) !== null) {
    const start = match.index
    const end = start + match[0].length
    const content = match[1].trim()
    matches.push({ start, end, content })
  }
  return matches
}

export function deleteInjectCSS(injectList: InjectStr, mgc: MagicString) {
  injectList.forEach((value) => {
    mgc.overwrite(value.start, value.end, '')
  })
  return mgc.toString()
}
