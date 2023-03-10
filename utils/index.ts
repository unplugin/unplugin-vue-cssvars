export * from './log'
export * from './constant'
export const completeSuffix = (fileName: string, suffix = 'css') => {
  return !fileName.endsWith(`.${suffix}`) ? `${fileName}.${suffix}` : fileName
}
