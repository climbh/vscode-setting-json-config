import type { ExtensionContext } from 'vscode'
import { commands, window, workspace } from 'vscode'
import { prefix } from '../constants'
import defaultConfig from '../json/defaultConfig.json'
import { useStore } from '../store'
import { createSettingFileAuto, deepMerge } from '../utils/util'

export function fileNestingConfig(ctx: ExtensionContext) {
  return commands.registerCommand('climbh.file-nesting', async () => {
    // 获取项目的根目录路径
    const workspaceFolders = workspace.workspaceFolders?.[0]?.uri.path
    if (!workspaceFolders)
      return window.showErrorMessage('No workspace folder found.')
    const config = workspace.getConfiguration()
    const { getAllStore, getStore } = useStore(ctx)
    const storeKeys = await getAllStore()
    const data = (await Promise.all(storeKeys.filter(key => key.startsWith(prefix)).map(key => getStore(key)))).map(t => JSON.parse(t as any))
    const picks = data.map(({ name, desc }) => {
      return {
        label: name,
        description: desc,
      }
    })

    const selectConfigString = await window.showQuickPick([
      {
        label: '文件嵌套',
        description: '使文件嵌套,目录看起来更清爽',
      },
      ...picks,
    ])
    if (!selectConfigString)
      return

    createSettingFileAuto('.vscode/settings.json')

    if (selectConfigString?.label === '默认') {
      config.update('explorer.fileNesting.patterns', defaultConfig['explorer.fileNesting.patterns'])
    }
    else {
      const useConfig = await getStore(prefix + selectConfigString.label) as string
      const code = JSON.parse(useConfig)?.code
      for (const key in code) {
        console.log('这是key:', key, code[key])
        config.update(key, code[key])
      }
    }
  })
}
