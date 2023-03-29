import type { Node } from '@babel/types'
import type { FilterPattern } from '@rollup/pluginutils'
import type less from 'less'
import type sass from 'sass'
import type stylus from 'stylus'
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

  /**
   * unplugin-vue-cssvars depends on the vue compiler,
   * there may be duplicate css after packaging, here we clear it
   */
  revoke?: boolean

  /**
   * preprocessor
   * the unplugin-vue-cssvars package does not integrate a preprocessor,
   * when you want to use unplugin-vue-cssvars in the preprocessor file,
   * please pass the preprocessor to unplugin-vue-cssvars
   * @property { sass | less | stylus }
   */
  preprocessor?: PreProcessor

  /**
   * Specify the file to be compiled, for example,
   * if you want to compile scss, then you can pass in ['** /**.sass']
   * @property { ['** /**.css', '** /**.less', '** /**.scss', '** /**.sass', '** /**.styl'] }
   * @default ['** /**.css']
   */
  includeCompile?: Array<string>
}

export declare interface PreProcessor {
  sass?: typeof sass
  less?: typeof less
  stylus?: typeof stylus
}
export declare type SearchGlobOptions = Options

export interface ICSSFile {
  importer: Set<string>
  vBindCode: Set<string> | null
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
