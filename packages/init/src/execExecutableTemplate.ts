import { exec } from '@munan-cli/utils'
import type { ProjectProps, TemplateProps } from './types'

// 执行可执行模板
export function execExecutableTemplate(rootFile: string, options: {
  targetPath: string
  template: TemplateProps
} & ProjectProps) {
  const code = `require('${rootFile.replaceAll('\\', '/')}')(${JSON.stringify(options)})`
  return new Promise((resolve, reject) => {
    const event = exec('node', ['-e', code], { stdio: 'inherit' })
    event.on('close', (data) => {
      if (data && data > 0)
        reject(new Error('执行失败'))
      resolve(data)
    })
  })
}
