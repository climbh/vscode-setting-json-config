import type { ExtensionContext } from 'vscode'

export function useStore(ctx: ExtensionContext) {
  function getStore(key: string) {
    return ctx.globalState.get(key)
  }

  function setStore(key: string, value: any) {
    return ctx.globalState.update(key, JSON.stringify(value))
  }

  function getAllStore() {
    return ctx.globalState.keys()
  }

  function removeStore(key: string) {
    return ctx.globalState.update(key, undefined)
  }

  return {
    getStore,
    setStore,
    getAllStore,
    removeStore,
  }
}
