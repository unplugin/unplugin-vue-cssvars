import type { FilterPattern } from '@rollup/pluginutils'
export interface Options {
  /**
   * Provide path which will be transformed
   *
   * @default process.cwd()
   */
  rootDir?: string
  /**
   * RegExp or glob to match files to be transformed
   */
  include?: FilterPattern

  /**
   * RegExp or glob to match files to NOT be transformed
   */
  exclude?: FilterPattern
}

export declare type SearchGlobOptions = Options

export interface ICSSFile {
  importer: Set<string>
  vBindCode: Record<string, Set<string>> | null
}
export declare type ICSSFileMap = Map<string, ICSSFile>
