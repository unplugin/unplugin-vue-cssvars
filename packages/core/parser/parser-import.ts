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
export function parseImports(source: string): {
  imports: ImportStatement[]
  getCurState: () => ParserState
  getCurImport: () => undefined | ImportStatement
} {
  const imports: ImportStatement[] = []
  let currentImport: ImportStatement | undefined
  let state = ParserState.Initial
  let i = 0

  while (i < source.length) {
    const char = source[i]
    switch (state) {
      case ParserState.Initial:
        if (char === '@')
          state = ParserState.At

        break
      case ParserState.At:
        if (char === 'i') {
          state = ParserState.AtImport
          currentImport = { type: 'import', path: '' }
          i++ // skip over "i" to next character
        } else if (char === 'u') {
          state = ParserState.AtUse
          currentImport = { type: 'use', path: '' }
          i++ // skip over "u" to next character
        } else if (char === 'r') {
          state = ParserState.AtRequire
          currentImport = { type: 'require', path: '' }
          i++ // skip over "u" to next character
        } else {
          state = ParserState.Initial
        }
        break
      case ParserState.AtImport:
      case ParserState.AtUse:
      case ParserState.AtRequire:
        if (char === "'" || char === '"') {
          state = ParserState.StringLiteral
          currentImport!.start = i
          currentImport!.path += char
        } else if (char === ';') {
          if (currentImport && currentImport.start !== undefined) {
            currentImport.end = i
            imports.push(currentImport)
            currentImport = undefined
          }
          state = ParserState.Initial
        }
        break
      case ParserState.StringLiteral:
        if (char === "'" || char === '"') {
          if (currentImport!.type === 'import')
            state = ParserState.AtImport

          if (currentImport!.type === 'use')
            state = ParserState.AtUse

          if (currentImport!.type === 'require')
            state = ParserState.AtRequire

          currentImport!.path += char
        } else { currentImport!.path += char }

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
