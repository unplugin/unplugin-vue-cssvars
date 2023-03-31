const innerAtRule = 'media,extend,at-root,debug,warn,forward,mixin,include,function,error,keyframes,font-face,page,supports,namespace,return,if,else,for,while,each,content'
export enum ParserState {
  Initial,
  InlineComment,
  Comment,
  AtStart,
  AtEnd,
  AtImport,
  AtUse,
  AtRequire,
  QuotesStart,
  QuotesEnd,
  StringLiteral,
}

export interface ImportStatement {
  type: 'import' | 'use' | 'require'
  path: string
  start?: number
  end?: number
  suffix?: string
}

export function parseImports(content: string, helper?: Array<Function>): {
  imports: ImportStatement[]
  getCurState: () => ParserState
  getCurImport: () => undefined | ImportStatement
} {
  const imports: ImportStatement[] = []
  let currentImport: ImportStatement | undefined
  let state = ParserState.Initial
  let i = 0
  let AtPath = ''
  const source = content
  while (i < source.length) {
    const char = source[i]
    if (/[\r\t\f\v\\]/g.test(char)) {
      i++
      continue
    }

    switch (state) {
      case ParserState.Initial:
        if (char === '@')
          state = ParserState.AtStart
        if (char === '/' && source[i + 1] === '/')
          state = ParserState.InlineComment
        if (char === '/' && source[i + 1] === '*')
          state = ParserState.Comment
        break
      case ParserState.InlineComment:
        if (char === '\n')
          state = ParserState.Initial
        break
      case ParserState.Comment:
        if (char === '*' && source[i + 1] === '/')
          state = ParserState.Initial
        break
      case ParserState.AtStart:
        if (/[A-Za-z]$/.test(char))
          AtPath = AtPath + char
        else
          state = ParserState.AtEnd

        if (i === source.length - 1) {
          if (char === '"' || char === "'")
            throw new Error('syntax error: unmatched quotes')
          else
            walkContentEnd(i)
        }
        if (!(/[A-Za-z]$/.test(char))
          && char !== '\n'
          && char !== ' '
          && char !== '-')
          throw new Error('syntax error')

        break
      case ParserState.AtEnd:
        if (char !== '\n' && char !== ' ' && char !== '-') {
          if (char === '/')
            throw new Error('syntax error')

          if (AtPath === 'import') {
            AtPath = ''
            state = ParserState.AtImport
            currentImport = { type: 'import', path: '' }
            i--
          } else if (AtPath === 'use') {
            AtPath = ''
            state = ParserState.AtUse
            currentImport = { type: 'use', path: '' }
            i--
          } else if (AtPath === 'require') {
            AtPath = ''
            state = ParserState.AtRequire
            currentImport = { type: 'require', path: '' }
            i--
          } else {
            if (!innerAtRule.includes(AtPath))
              throw new Error('syntax error: unknown At Rule')

            AtPath = ''
            state = ParserState.Initial
          }
        }

        break
      case ParserState.AtImport:
      case ParserState.AtUse:
      case ParserState.AtRequire:
        // '@require test.css;@require test2.css'
        if (char === '@' && !(/[A-Za-z]$/.test(source[i - 1]))) {
          i--
          state = ParserState.Initial
          break
        }

        if (char === '/' && (source[i + 1] === '/' || source[i + 1] === '*')) {
          i--
          state = ParserState.Initial
          break
        }

        if (char === "'" || char === '"') {
          currentImport!.start = i
          state = ParserState.QuotesStart
          break
        }
        if (char !== '\n' && char !== ' ') {
          currentImport!.start = i
          currentImport!.path += char
          state = ParserState.StringLiteral
          break
        }
        break
      case ParserState.QuotesStart:
        if (char === "'" || char === '"') {
          currentImport!.end = i
          state = ParserState.QuotesEnd
          if (i === source.length - 1)
            walkContentEnd(i)
          break
        }
        if (i === source.length - 1)
          throw new Error('syntax error: unmatched quotes')

        currentImport!.path += char
        break
      case ParserState.QuotesEnd:
        if (i === source.length - 1 || char === ';' || char === '\n') {
          walkContentEnd(i)
        } else {
          i--
          state = ParserState.StringLiteral
        }
        break
      case ParserState.StringLiteral:
        if (char === ';' || char === '\n') {
          walkContentEnd(i)
          break
        }

        // '@require test.css@require test2.css'
        // '@import ./test1, ./test2'
        if (
          char !== '@'
          && (char === ' '
          || char === ','
          || char === '"'
          || char === "'")) {
          const curType = currentImport?.type
          walkContentEnd(i)
          if (curType === 'import') {
            state = ParserState.AtImport
            currentImport = { type: 'import', path: '' }
          } else if (curType === 'use') {
            state = ParserState.AtUse
            currentImport = { type: 'use', path: '' }
          } else if (curType === 'require') {
            state = ParserState.AtRequire
            currentImport = { type: 'require', path: '' }
          }

          if (char === "'" || char === '"') {
            currentImport!.start = i
            state = ParserState.QuotesStart
            if (i === source.length - 1 && (char === '"' || char === "'"))
              throw new Error('syntax error: unmatched quotes')

            break
          }

          break
        }

        currentImport!.path += char
        if (i === source.length - 1)
          walkContentEnd(i)

        break
    }
    i++
  }

  function walkContentEnd(index: number) {
    pushCurrentImport(index)
    state = ParserState.Initial
  }

  function pushCurrentImport(index: number) {
    if (currentImport && currentImport.start !== undefined) {
      currentImport.end = index
      if (helper) {
        helper.forEach((fn) => {
          currentImport = fn(currentImport)
        })
      }
      imports.push(currentImport)
      currentImport = undefined
    }
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
