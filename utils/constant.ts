export const NAME = 'unplugin-vue-cssvars'
export const SUPPORT_FILE_LIST = ['**/**.css']
export const SUPPORT_FILE_REG = /\.(css|sass|scss|styl|less)$/i
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
export const JSX_TSX_REG = /^(.*\.(jsx|tsx)$)/
