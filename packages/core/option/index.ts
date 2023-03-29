import { resolve } from 'path'
import {
  DEFAULT_EXCLUDE_REG,
  DEFAULT_INCLUDE_REG,
  SUPPORT_FILE_LIST,
  extend,
} from '@unplugin-vue-cssvars/utils'
import type { Options } from '../types'

const defaultOption: Options = {
  rootDir: resolve(),
  include: DEFAULT_INCLUDE_REG,
  exclude: DEFAULT_EXCLUDE_REG,
  revoke: true,
  includeCompile: SUPPORT_FILE_LIST,
}

export function initOption(option: Options) {
  option = extend(defaultOption, option)
  return option
}
