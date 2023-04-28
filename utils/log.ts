import chalk from 'chalk'

export declare type TLog = 'error' | 'warning' | 'info' | 'success'

export const logType = {
  info: (msg: string, prefix = '') => chalk.blueBright.bold(`${prefix}${msg}`),
  error: (msg: string, prefix = '') => chalk.redBright.bold(`${prefix}${msg}`),
  warning: (msg: string, prefix = '') => chalk.yellowBright.bold(`${prefix}${msg}`),
  success: (msg: string, prefix = '') => chalk.greenBright.bold(`${prefix}${msg}`),
}

export const log = (type: TLog, msg: string, prefix = '[unplugin-vue-cssvars]:') => {
  console.log(logType[type](msg, prefix))
}
