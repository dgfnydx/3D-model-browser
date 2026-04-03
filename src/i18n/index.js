import { createI18n } from 'vue-i18n'
import enUS from '../locales/en-US'
import zhCN from '../locales/zh-CN'

const STORAGE_KEY = 'model-browser-locale'
const DEFAULT_LOCALE = 'zh-CN'
const SUPPORTED_LOCALES = ['zh-CN', 'en-US']

function resolveLocale() {
  const savedLocale = window.localStorage.getItem(STORAGE_KEY)
  if (SUPPORTED_LOCALES.includes(savedLocale)) {
    return savedLocale
  }

  const browserLocale = navigator.language
  if (SUPPORTED_LOCALES.includes(browserLocale)) {
    return browserLocale
  }

  if (browserLocale.toLowerCase().startsWith('zh')) {
    return 'zh-CN'
  }

  return DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  locale: resolveLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return

  i18n.global.locale.value = locale
  window.localStorage.setItem(STORAGE_KEY, locale)
}
