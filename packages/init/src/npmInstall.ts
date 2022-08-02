import { exec, getNpmRegistry } from '@munan-cli/utils'

// 安装依赖
export async function npmInstall(targetPath: string) {
  return new Promise((resolve, reject) => {
    const event = exec('npm', ['install', `--registry=${getNpmRegistry()}`], { stdio: 'inherit', cwd: targetPath })
    event.on('close', (data) => {
      if (data && data > 0)
        reject(new Error('安装依赖失败'))
      else
        resolve(null)
    })
  })
}
