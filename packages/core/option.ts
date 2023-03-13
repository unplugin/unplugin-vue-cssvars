import { resolve } from 'path'
import { extend } from '@unplugin-vue-cssvars/utils'
import type { Options } from './types'
export const defaultOption: Options = {
  rootDir: resolve(),
  include: [/\.vue$/],
  exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.dist[\\/]/],
}

export function initOption(option: Options) {
  option = extend(defaultOption, option)
  return option
}
