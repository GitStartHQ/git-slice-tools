import { terminal } from 'terminal-kit'
import { LogScope } from '../types'

let lastLogLine = ''
let lastLogTime: Date = new Date()

export const logWriteLine = (scope: LogScope, content: string) => {
    lastLogTime = new Date()
    lastLogLine = `[${lastLogTime.toISOString()}] ${scope}: ${content.trim()}`

    terminal(`${lastLogLine}\n`)
}

export const logExtendLastLine = (content: string) => {
    const duration = (new Date().getTime() - lastLogTime.getTime()) / 1000

    terminal.up(1)(`${lastLogLine}${content.trim()} (${duration.toFixed(3)}s)\n`)
}
