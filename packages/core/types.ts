import type { Node } from '@babel/types'
import type { FilterPattern } from '@rollup/pluginutils'
export interface Options {
  /**
   * Provide path which will be transformed
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

  /**
   * unplugin-vue-cssvars depends on the vue compiler,
   * there may be duplicate css after packaging, here we clear it
   */
  revoke?: boolean

  /**
   * Specify the file to be compiled, for example,
   * if you want to compile scss, then you can pass in ['** /**.sass']
   * @property { ['** /**.css', '** /**.less', '** /**.scss', '** /**.sass', '** /**.styl'] }
   * @default ['** /**.css']
   */
  includeCompile?: Array<string>

  /**
   * Flag whether to start with server at development time,
   * because unplugin-vue-cssvars uses different strategies for packaging and server development
   * @default true
   */
  server?: boolean

  /**
   * alias
   * @default undefined
   */
  alias?: Record<string, string>
}

export declare type SearchGlobOptions = Options

export interface ICSSFile {
  importer: Set<string>
  vBindCode: Array<string> | null
  content: string
  lang: string
}
export declare type ICSSFileMap = Map<string, ICSSFile>
export declare type VariableName = Record<string, Node | undefined | null>
export interface AssetInfo {
  source: string | Uint8Array
  fileName: string
  type: 'asset'
  isAsset: true
  name: string | undefined
}

export type IBundle = Record<string, AssetInfo>

export interface InjectStrItem {
  start: number
  end: number
  content: string
}
export declare type InjectStr = Array<InjectStrItem>
