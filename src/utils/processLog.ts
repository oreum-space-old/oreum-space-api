import { writeSync } from 'fs'

declare global {
  namespace NodeJS {
    interface Process {
      module?: string
      action?: string
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
  info:    '!',
  log:     '¡',
  warn:    '⚠',
  error:   '✕',
  request: '→'
}

function createLog (level: Level) {
  return function (this: typeof process, ...outputs: Array<unknown>) {
    writeSync(
      process.stdout.fd,
      `[ ${
        LEVELS[level]
      } | ${
        process.module || 'null'
      } | ${
        process.action || 'null'
      } ] ${outputs.join(' ')}`
    )
  }
}

void (function () {
  process.info = createLog('info').bind(process)
  process.log = createLog('log').bind(process)
  process.warn = createLog('warn').bind(process)
  process.error = createLog('error').bind(process)
  process.request = createLog('request').bind(process)
})()

export default {}