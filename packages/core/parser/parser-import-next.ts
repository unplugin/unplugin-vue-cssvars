export enum ParserState {
  Initial,
  At,
  AtImport,
  AtUse,
  AtRequire,
  StringLiteral,
}

export interface ImportStatement {
  type: 'import' | 'use' | 'require'
  path: string
  start?: number
  end?: number
  suffix?: string
}
const delTransformSymbol = (content: string) => content.replace(/[\r\t\f\v\\]/g, '')
export function parseImportsNext(content: string): {
  imports: ImportStatement[]
  getCurState: () => ParserState
  getCurImport: () => undefined | ImportStatement
} {
  const imports: ImportStatement[] = []
  let currentImport: ImportStatement | undefined
  let state = ParserState.Initial
  let i = 0
  let AtPath = ''
  const source = delTransformSymbol(content)
  while (i < source.length) {
    const char = source[i]
    switch (state) {
      case ParserState.Initial:
        if (char === '@')
          state = ParserState.At
        break
      case ParserState.At:
        AtPath = AtPath + char
        if (AtPath === 'import') {
          AtPath = ''
          state = ParserState.AtImport
          currentImport = { type: 'import', path: '' }
          i++ // skip over "i" to next character
        } else if (AtPath === 'use') {
          AtPath = ''
          state = ParserState.AtUse
          currentImport = { type: 'use', path: '' }
          i++ // skip over "u" to next character
        } else if (AtPath === 'require') {
          AtPath = ''
          state = ParserState.AtRequire
          currentImport = { type: 'require', path: '' }
          i++ // skip over "u" to next character
        }
        // TODO ...
        if (AtPath.length >= 7 && AtPath !== 'require')
          state = ParserState.Initial

        break
      case ParserState.AtImport:
      case ParserState.AtUse:
      case ParserState.AtRequire:
        debugger
        // 当字符不是空格，且前一个是空格，进入取值
        if (char !== ' ' && source[i - 1] === ' ') {
          state = ParserState.StringLiteral
          currentImport!.start = i
          currentImport!.path += char
        } else if (char === '\n' || i === source.length - 1) {
          if (currentImport && currentImport.start !== undefined) {
            currentImport.end = i
            imports.push(currentImport)
            currentImport = undefined
          }
          state = ParserState.Initial
        }
        break
      case ParserState.StringLiteral:
        // 遇到引号，其起始位置也是，则是有引号状态下的取值结束
        if ((char === "'" || char === '"')
          && (currentImport!.start || currentImport!.start === 0)
          && (source[currentImport!.start] === char)) {
          if (currentImport!.type === 'import')
            state = ParserState.AtImport

          if (currentImport!.type === 'use')
            state = ParserState.AtUse

          if (currentImport!.type === 'require')
            state = ParserState.AtRequire

          currentImport!.path += char
        } else {
          // 取值
          currentImport!.path += char
        }

        break
    }
    i++
  }

  function getCurState() {
    return state
  }
  function getCurImport() {
    return currentImport
  }
  return {
    imports,
    getCurState,
    getCurImport,
  }
}
