import Log from './log'
import FormatPath from './formatPath'
import p from './Package'
import Exec, { execCommand as ExecCommand } from './exec'
import Spinner from './spinner'

export const Package = p
export const log = Log
export const formatPath = FormatPath
export const exec = Exec
export const execCommand = ExecCommand
export const spinner = Spinner

export * from './npm'
export * from './inquirer'
export * from './ejs'
export * from './file'
export * from './formatPackageName'
export * from './isImage'
export * from './validatePackageName'
export * from './terminalLink'

