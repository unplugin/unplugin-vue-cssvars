import chalk from 'chalk'
import type { TLog } from './types'
export const log = (type: TLog, msg: string) => {
  if (type === 'info')
    console.log(chalk.blueBright.bold(`${msg}`))

  if (type === 'error')
    console.log(chalk.redBright.bold(`${msg}`))

  if (type === 'warning')
    console.log(chalk.yellowBright.bold(`${msg}`))

  if (type === 'success')
    console.log(chalk.greenBright.bold(`${msg}`))
}
