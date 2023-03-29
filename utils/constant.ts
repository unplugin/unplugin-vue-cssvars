export const NAME = 'unplugin-vue-cssvars'
export const SUPPORT_FILE_LIST = ['**/**.css']
export const FG_IGNORE_LIST = ['**/node_modules/**', '**/dist/**', '**/.git/**']
export const SUPPORT_FILE = {
  CSS: 'css',
  LESS: 'less',
  SASS: 'sass',
  SCSS: 'scss',
  STYLUS: 'stylus',
  STYL: 'styl',
}
export const DEFAULT_INCLUDE_REG = [/\.vue$/]
export const DEFAULT_EXCLUDE_REG = [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.dist[\\/]/]

export const INJECT_FLAG = '\n/* created by @unplugin-vue-cssvars */'
export const INJECT_PREFIX_FLAG = '\n/* <inject start> */\n'
export const INJECT_SUFFIX_FLAG = '\n/* <inject end> */\n'
