import type { ExtensionContext, WorkspaceConfiguration } from 'vscode'
import { customSetting } from './scripts/custom-setting'
import { customSettingRemove } from './scripts/custom-setting-remove'
import { fileNestingConfig } from './scripts/file-nesting'

export function activate(context: ExtensionContext) {
  // 文件的嵌套配置
  const _fileNestingConfig = fileNestingConfig(context)
  const _customSetting = customSetting(context)
  const _customSettingRemove = customSettingRemove(context)

  context.subscriptions.push(_fileNestingConfig)
  context.subscriptions.push(_customSetting)
  context.subscriptions.push(_customSettingRemove)
}

// This method is called when your extension is deactivated
export function deactivate() {}

/**
 * 默认配置
 * @param config 配置
 */
export function defaultConf(config: WorkspaceConfiguration) {
  // 默认的配置
  config.update('window.autoDetectColorScheme', true)
  config.update('workbench.preferredLightColorTheme', 'Vitesse Light')
  config.update('workbench.preferredDarkColorTheme', 'Vitesse Dark')
}
