export const setTheme = (theme: string) => {
  const appRoot = document.documentElement
  if (appRoot != null) {
    appRoot.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      appRoot.classList.add('dark')
      appRoot.classList.remove('light')
    } else {
      appRoot.classList.add('light')
      appRoot.classList.remove('dark')
    }
  }
}

export const openUrl = (url?: string, target?: string, features?: string) => {
  if (url) {
    if (import.meta.env.VITE_UTOOLS === 'true') {
      utools.shellOpenExternal(url)
    } else {
      window.open(url, '_blank')
    }
  }
}

export const findHelpItemByFlows = (flows: HelpFlow[], code: string): HelpItem | undefined => {
  for (const flow of flows) {
    for (const type of flow.types) {
      const helpItem = findHelpItem(type.items, code)
      if (helpItem != null) {
        return helpItem
      }
    }
  }
}

export const findHelpItem = (helpItems: HelpItem[], code: string): HelpItem | undefined => {
  for (const helpItem of helpItems) {
    if (helpItem.code === code) {
      return helpItem
    }
    if (helpItem.children != null) {
      const child = findHelpItem(helpItem.children, code)
      if (child != null) {
        return child
      }
    }
  }
}
