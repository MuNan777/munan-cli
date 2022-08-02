import downgradeRoot from 'downgrade-root'
import colors from 'colors/safe'

// 检查是否为 root 启动
export function checkRoot() {
  try {
    downgradeRoot() // root 降级
  }
  catch (e) {
    colors.red('请避免使用 root 账户启动本应用')
  }
}
