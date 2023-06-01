
/**
 * 处理json数据，递归删除所有__开头的属性名
 * @return 本身
 */
export const handleJson = (json: any) => {
  for (const key in json) {
    if (key.startsWith('__')) { // 删除属性
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete json[key]
    } else {
      const value = json[key]
      if (typeof value === 'object') {
        handleJson(value)
      }
    }
  }
  return json
}
