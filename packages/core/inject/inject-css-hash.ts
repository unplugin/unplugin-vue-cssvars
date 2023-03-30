import type { TMatchVariable } from '../parser'

// TODO unit test
export function injectCssOnServer(
  code: string,
  vbindVariableList: TMatchVariable,
) {
  vbindVariableList.forEach((vbVar) => {
    code = code.replaceAll(`v-bind-m(${vbVar.value})`, `var(--${vbVar.hash})`)
  })
  return code
}
