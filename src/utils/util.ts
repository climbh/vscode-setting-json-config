import fs from 'node:fs'
import path from 'node:path'
import { ESLint } from 'eslint'
import { window, workspace } from 'vscode'

export function deepMerge(target: any, source: any): any {
  Object.keys(source).forEach((key) => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
      if (typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue)) {
        deepMerge(targetValue, sourceValue)
      }
      else {
        target[key] = deepCopy(sourceValue)
      }
    }
    else {
      target[key] = sourceValue
    }
  })
  return target
}

// 辅助函数用于深拷贝对象
function deepCopy(obj: any): any {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 检查路径在电脑中是否存在
 * @param _path 路径
 */
export function hasPath(_path: string) {
  return !!path && fs.existsSync(path.join(__dirname, _path))
}

/**
 * 判断字符串是否为json格式
 * @param str 字符串
 */
export function isJson(str: string) {
  try {
    JSON.parse(str)
    return true
  }
  catch {
    return false
  }
}

/**
 *  获取指定目录下所有文件
 * @param dir
 * @params filter 文件过滤器
 * @returns 文件列表
 */
export function readDirFiles(dir: string, filter?: (file: fs.Dirent) => boolean) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (!entry.isDirectory() || filter?.(entry)) {
      files.push(entry)
    }
  }
  return files
}

/**
 * 创建配置文件
 */
export function createSettingFileAuto(filePath: string) {
  const workspaceFolders = workspace.workspaceFolders?.[0]?.uri.path
  const _path = workspaceFolders ? path.join(workspaceFolders, filePath) : `${__dirname}.vscode`
  const splits = _path.split('/')
  for (let i = 0; i < splits.length; i++) {
    const index = splits[i].indexOf('.')
    const isFile = index > 0
    const _path = splits.slice(0, i + 1).join('/')
    if (!fs.existsSync(_path) && _path) {
      if (isFile) {
        fs.writeFileSync(_path, '{}')
      }
      else {
        fs.mkdirSync(_path)
      }
    }
  }
}
