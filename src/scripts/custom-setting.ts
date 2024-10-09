import type { ExtensionContext } from 'vscode'
import { commands, ViewColumn, window, workspace } from 'vscode'
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
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自定义个人设置</title>
    <style>
        .wrap {
            padding: 20px;
        }
        .name-input,
        .desc-input {
            margin-bottom: 14px;
        }
        .name-input input,
        .desc-input input {
            width: 100%;
            height: 24px;
            padding: 5px;
            background-color: #fafafa;
            border: 1px solid #999;
            color: #000;
            outline: none;
        }

        .code-input textarea {
            width: 100%;
            padding: 5px;
            background-color: #fafafa;
            border: 1px solid #999;
            color: #000;
            outline: none;
        }
        button {
            padding: 4px;
        }
    </style>
</head>
<body>
    <div class="wrap">
        <p style="color: red;">配置内容如果settings.json不支持改字段,那么在使用合并时则不会写入到settting.json文件中</p>
        <div class="name-input">
            <input id="configName" type="text" placeholder="请输入配置名">
        </div>
        <div class="desc-input">
            <input id="configDesc" type="text" placeholder="请输入配置描述">
        </div>
        <div class="code-input">
            <textarea id="configCode" rows="10" placeholder="请输入自定义配置(json格式)"></textarea>
        </div>
        <div>
            <button id="submit">保存设置</button>
        </div>
    </div>


    <script>
        const vscode = acquireVsCodeApi();
        document.querySelector('#submit').addEventListener('click', () => {
            const code = document.querySelector('#configCode').value
            const desc = document.querySelector('#configDesc').value
            const name = document.querySelector('#configName').value
            vscode.postMessage({
                command: 'customSetting',
                data: {
                    code,
                    name,
                    desc
                }
            })
        }) 

        toggleSubmitBtnText()

        window.addEventListener('message', (event) => {
            const message = event.data;
            if(message.command === 'clearInput') {
                document.querySelector('#configCode').value = ''
                document.querySelector('#configName').value = ''
                document.querySelector('#configDesc').value = ''
                toggleSubmitBtnText()
            } else if(message.command === 'editConfig') {
                toggleSubmitBtnText('edit')
                const { name, desc, code } = message.data
                document.querySelector('#configCode').value = JSON.stringify(code)
                document.querySelector('#configName').value = name
                document.querySelector('#configDesc').value = desc
            }
        })

        function toggleSubmitBtnText(state) {
            let text = '新增配置'
            switch (state) {
                case 'edit':
                    text = '编辑配置'
                    break;
            
                default:
                    break;
            }

            document.querySelector('#submit').innerText = '确认' + text

        }
    </script>
</body>
</html>`
    }

    function clearInput() {
      panel.webview.postMessage({ command: 'clearInput' })
    }
  })
}
