import { spawn } from 'child_process'
import * as path from 'path'

export function relativeDir(relative: string, absolute: string) {
  const rela = relative.split('/')
  rela.shift()
  const abso = absolute.split('/')
  abso.shift()
  let num = 0
  for (let i = 0; i < rela.length; i++) {
    if (rela[i] === abso[i])
      num++
    else
      break
  }
  rela.splice(0, num)
  abso.splice(0, num)
  let str = ''
  for (let j = 0; j < abso.length - 1; j++)
    str += '../'

  if (!str)
    str += './'

  str += rela.join('/')
  return str
}

export const r = (...args: any[]) => path.resolve(__dirname, '..', ...args)

export const run = async(command: string) => {
  return new Promise((resolve) => {
    const [cmd, ...args] = command.split(' ')
    const app = spawn(cmd, args, {
      cwd: r('./'),
      stdio: 'inherit',
      shell: true,
    })

    app.on('close', resolve) //
  })
}
