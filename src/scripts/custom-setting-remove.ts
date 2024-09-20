import type { ExtensionContext } from 'vscode'
import { commands, window } from 'vscode'
import { prefix } from '../constants'
import { useStore } from '../store'

export function customSettingRemove(ctx: ExtensionContext) {
  return commands.registerCommand('climbh.remove-config', async () => {
    const { getAllStore, removeStore } = useStore(ctx)

    const keys = await getAllStore()

    const configKeys = keys.filter((key: string) => key.startsWith(prefix)).map((key: string) => key.replace(prefix, ''))
    const removeKey = await window.showQuickPick(configKeys)
    if (removeKey) {
      await removeStore(prefix + removeKey)
      window.showInformationMessage(`${removeKey} 删除成功`)
    }
  })
}
