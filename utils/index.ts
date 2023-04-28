import { join, parse } from 'path'
import { SUPPORT_FILE, SUPPORT_FILE_REG } from './constant'
export * from './constant'
export * from './log'
export * from './async-task'

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

export const completeSuffix = (fileName: string, suffix: string, force?: boolean) => {
  const transformSymbolRes = transformSymbol(fileName)
  if (force) {
    const { dir, name } = parse(transformSymbolRes)
    return transformSymbol(join(dir, `${name}.${suffix || SUPPORT_FILE.CSS}`))
  }
  return !(SUPPORT_FILE_REG.test(transformSymbolRes)) && suffix ? `${transformSymbolRes}.${suffix}` : transformSymbolRes
}
