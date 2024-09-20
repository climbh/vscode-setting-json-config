import type { ExtensionContext } from 'vscode'
import fs from 'node:fs'
import path from 'node:path'
import { commands, env, extensions, Uri, ViewColumn, window, workspace } from 'vscode'
import { prefix } from '../constants'
import { useStore } from '../store'

export function customSetting(ctx: ExtensionContext) {
  return commands.registerCommand('climbh.custom-config', async () => {
    // 获取项目的根目录路径
    const workspaceFolders = workspace.workspaceFolders?.[0]?.uri.path as string
    if (!workspaceFolders)
      return window.showErrorMessage('No workspace folder found.')

    const { setStore, getStore } = useStore(ctx)

    let isEdit = false
    const panel = window.createWebviewPanel(
      'customWebviewPanel', // 用于识别Webview面板的标识符
      '自定义配置面板', // 显示在标题栏上的标题
      ViewColumn.Beside, // 打开位置
      {
        enableScripts: true, // 允许执行脚本
        retainContextWhenHidden: false, // 即使面板隐藏也保留状态
      },
    )
    // 设置Webview的内容
    panel.webview.html = getWebviewContent()

    // 处理Webview面板发送的消息
    panel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'customSetting') {
        const { name, code, desc } = message.data
        if (name.trim() === '' || !name) {
          return window.showErrorMessage('请输入配置名称')
        }
        if (desc.trim() === '' || !desc) {
          return window.showErrorMessage('请输入配置描述')
        }
        if (code.trim() === '' || !code) {
          return window.showErrorMessage('请输入配置代码')
        }
        const config = await getStore(prefix + name) as string
        if (config && !isEdit) {
          const coverBtn = '覆盖'
          const editBtn = '编辑'
          const result = await window.showInformationMessage('配置名称已存在!', editBtn, coverBtn)
          if (result === editBtn) {
            isEdit = true
            panel.reveal()
            panel.webview.postMessage({ command: 'editConfig', data: JSON.parse(config) })
            return
          }
        }

        // 写入配置
        try {
          setStore(prefix + name, {
            name,
            code: JSON.parse(code),
            desc,
          })
          clearInput()
          window.showInformationMessage('配置已保存')
          isEdit = false
        }
        catch (error) {
          window.showErrorMessage(`配置保存失败:${error}`)
        }
      }
    }, undefined, ctx.subscriptions)

    // 监听面板关闭事件, 清除编辑状态
    panel.onDidDispose(() => {
      if (isEdit) {
        isEdit = false
      }
    })
    function getWebviewContent() {
      const indexPath = path.join(ctx.extensionPath, 'src/web/cutomSetting.html')
      const content = fs.readFileSync(indexPath, 'utf-8')
      return content
    }

    function clearInput() {
      panel.webview.postMessage({ command: 'clearInput' })
    }
  })
}
