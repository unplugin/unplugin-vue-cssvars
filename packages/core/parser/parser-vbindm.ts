
export enum ParserVBindMState {
  Initial,
  InlineComment,
  Comment,
  VBindM,
  VBindMValueStart,
  VBindMValue,
  VBindMValueEnd,
  StringLiteral,
}

export function parseVBindM(source: string): Array<string> {
  const result = new Set<string>()
  let state = ParserVBindMState.Initial
  let i = 0
  let curBuffer = ''
  let mark = 0

  while (i < source.length) {
    const char = source[i]
    switch (state) {
      case ParserVBindMState.Initial:
        if (char === '/' && source[i + 1] === '/')
          state = ParserVBindMState.InlineComment
        if (char === '/' && source[i + 1] === '*')
          state = ParserVBindMState.Comment
        if (char === 'v')
          state = ParserVBindMState.VBindM
        if (char === ')')
          mark--
        if (char === '(')
          mark++
        break
      case ParserVBindMState.InlineComment:
        if (char === '\n')
          state = ParserVBindMState.Initial
        break
      case ParserVBindMState.Comment:
        if (char === '*' && source[i + 1] === '/')
          state = ParserVBindMState.Initial
        if (i === source.length - 1)
          throw new Error('syntax error: unmatched */')
        break
      case ParserVBindMState.VBindM:
        if (char === '-'
            && source[i + 1] === 'b'
            && source[i + 2] === 'i'
            && source[i + 3] === 'n'
            && source[i + 4] === 'd'
            && source[i + 5] === '-'
            && source[i + 6] === 'm') {
          state = ParserVBindMState.VBindMValueStart
          i = i + 6
        }
        break
      case ParserVBindMState.VBindMValueStart:
        if (char !== '(') {
          i--
          state = ParserVBindMState.VBindMValue
          break
        }

        mark++
        break
      case ParserVBindMState.VBindMValue:
        if (char !== ')') {
          curBuffer = curBuffer + char
        } else {
          i--
          state = ParserVBindMState.VBindMValueEnd
        }
        break
      case ParserVBindMState.VBindMValueEnd:
        if (char === ')') {
          mark--
          if (curBuffer) {
            result.add(curBuffer)
            curBuffer = ''
          }
          state = ParserVBindMState.Initial
        }
        break
    }
    i++
  }

  if (mark > 0)
    throw new Error('syntax error: unmatched )')
  if (mark < 0)
    throw new Error('syntax error: unmatched (')

  return [...result]
}
