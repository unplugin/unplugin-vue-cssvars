import { SUPPORT_FILE, SUPPORT_FILE_REG } from './constant'

export * from './constant'

export const extend = <
  T extends Record<string, any>,
  U extends Record<string, any>>(
    objFir: T,
    objSec: U): T & U => {
  return Object.assign({}, objFir, objSec)
}

export const setTArray = <T>(set: Set<T>): Array<T> => { return [...set] }

export const isEmptyObj = (val: unknown) => JSON.stringify(val) === '{}'

export const transformSymbol = (path: string) => path.replaceAll('\\', '/')

export const completeSuffix = (fileName: string, suffix = SUPPORT_FILE.CSS) => {
  const transformSymbolRes = transformSymbol(fileName)
  return !(SUPPORT_FILE_REG.test(transformSymbolRes)) ? `${transformSymbolRes}.${suffix}` : transformSymbolRes
}
