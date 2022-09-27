import { writeSync } from 'fs'

declare global {
  namespace NodeJS {
    interface Process {
      module?: string
      action?: string

      setModule (module?: string): Process

      setAction (action?: string): Process

      request (...outputs: Array<unknown>): void

      info (...outputs: Array<unknown>): void

      log (...outputs: Array<unknown>): void

      warn (...outputs: Array<unknown>): void

      error (...outputs: Array<unknown>): void
    }
  }
}

type Level = 'info' | 'log' | 'warn' | 'error' | 'request'

const LEVELS: Record<Level, string> = {
  info: '!',
  log: '¡',
  warn: '⚠',
  error: '✕',
  request: '→'
}

const COLORS: Record<Level, string> = {
  info: '\x9b38;2;83;148;236m',
  log: '\x9b38;2;41;153;153m',
  warn: '\x9b38;2;171;192;35m',
  error: '\x9b38;2;204;102;110m',
  request: '\x9b38;2;85;85;85m'
}

const R = '\x9b0m'
const B = '\x9b7m'

function getPrefix (level: Level) {
  const l = LEVELS[level]
  const c = COLORS[level]
  const date = new Date()
  const d = `${
    date.getHours().toString().padEnd(2, '0')
  }:${
    date.getMinutes().toString().padEnd(2, '0')
  }:${
    date.getSeconds().toString().padEnd(2, '0')
  }`
  if (process.module) {
    if (process.action) {
      const { action } = process
      process.action = undefined
      return `${ c }${ B } ${ l } ${ d } ${ process.module } ${ action } ${ R }${ c }${ R }`
    }
    return `${ c }${ B } ${ l } ${ d } ${ process.module } ${ R }${ c }${ R }`
  }
  return `${ c }${ B } ${ l } ${ d } ${ R }${ c }${ R }`
}

function createLog (level: Level) {
  return function (this: typeof process, ...outputs: Array<unknown>) {
    writeSync(
      process.stdout.fd,
      `${
        getPrefix(level)
      } ${
        outputs.join('\n').replace('\n', '\n  ')
      }\n`
    )
  }
}

void (
  function () {
    process.info = createLog('info').bind(process)
    process.log = createLog('log').bind(process)
    process.warn = createLog('warn').bind(process)
    process.error = createLog('error').bind(process)
    process.request = createLog('request').bind(process)
    process.setModule = function (module?: string) {
      process.module = module ? module.split('\\').at(-2) || module : module
      return process
    }
    process.setAction = function (action?: string) {
      process.action = action
      return process
    }
  }
)()

export default {}