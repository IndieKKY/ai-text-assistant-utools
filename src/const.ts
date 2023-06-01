export const STORAGE_ENV = 'atau_env'

export const APP_DOM_ID = 'root'
export const PAGE_MAIN = 'main'
export const PAGE_RESULT = 'result'
export const PAGE_SETTINGS = 'settings'

export const SERVER_URL_DEFAULT = 'https://api.openai.com'
export const PROMPT_DEFAULT = `Context:

'''
{{text}}
'''

Instruction: '''{{question}}'''`

export const LANGUAGE_DEFAULT = 'cn'

export const LANGUAGES = [{
  code: 'en',
  name: 'English',
}, {
  code: 'ena',
  name: 'American English',
}, {
  code: 'enb',
  name: 'British English',
}, {
  code: 'cn',
  name: '中文简体',
}, {
  code: 'cnt',
  name: '中文繁體',
}, {
  code: 'Spanish',
  name: 'español',
}, {
  code: 'French',
  name: 'Français',
}, {
  code: 'Arabic',
  name: 'العربية',
}, {
  code: 'Russian',
  name: 'русский',
}, {
  code: 'German',
  name: 'Deutsch',
}, {
  code: 'Portuguese',
  name: 'Português',
}, {
  code: 'Italian',
  name: 'Italiano',
}]
export const LANGUAGES_MAP: {[key: string]: typeof LANGUAGES[number]} = {}
for (const language of LANGUAGES) {
  LANGUAGES_MAP[language.code] = language
}

export const TONES = [
  {
    name: '专业',
    value: 'Professional',
  },
  {
    name: '随意',
    value: 'Casual',
  },
  {
    name: '直白',
    value: 'Straightforward',
  },
  {
    name: '自信',
    value: 'Confident',
  },
  {
    name: '友好',
    value: 'Friendly',
  },
]
