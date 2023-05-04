import { join, parse } from 'path'
import { normalizePath } from 'baiwusanyu-utils'
import { SUPPORT_FILE, SUPPORT_FILE_REG } from './constant'
export * from './constant'

export const setTArray = <T>(set: Set<T>): Array<T> => { return [...set] }

export const completeSuffix = (fileName: string, suffix: string, force?: boolean) => {
  const transformSymbolRes = normalizePath(fileName)
  if (force) {
    const { dir, name } = parse(transformSymbolRes)
    return normalizePath(join(dir, `${name}.${suffix || SUPPORT_FILE.CSS}`))
  }
  return !(SUPPORT_FILE_REG.test(transformSymbolRes)) && suffix ? `${transformSymbolRes}.${suffix}` : transformSymbolRes
}
