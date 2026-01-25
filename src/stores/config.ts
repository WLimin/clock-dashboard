import type { HAConfig, GreetingConfig, TTSConfig, TimeAnnouncementConfig } from '../types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { normalizeLocale, getTtsPrompts } from '../i18n'
import { useI18n } from 'vue-i18n'

const defaultLanguage = normalizeLocale(typeof navigator !== 'undefined' ? navigator.language : undefined)

export const useConfigStore = defineStore('config', () => {
  const showDrawer = ref(false)
  const activeTab = ref<'general' | 'clock' | 'ttsllm' | 'weather' | 'calendar' | 'smart'>('general')
  const language = ref(defaultLanguage)
  
  const { t } = useI18n()

  const haLayout = ref({
    /** 每行显示的设备数量：3、4 或 5 */
    columns: 3,
  })
  const haConfig = ref<HAConfig>({
    url: '',
    token: '',
    entities: [],
  })

  const clockConfig = ref({
    /** 时钟颜色 */
    color: '#ffffff',
    /** 字重 */
    fontWeight: 700,
    /** 数字随机倾斜 */
    enableTilt: true,
    /** 显示秒钟 */
    showSeconds: true,
    /** 透明度 */
    opacity: 0.9,
    /** 24小时制 */
    is24Hour: true,
  })

  const calendarConfig = ref({
    /** 一周的开始：0 为周日，1 为周一 */
    weekStartDay: 0,
    /** 显示法定节假日 */
    showHolidays: true,
  })

  /** 整点报时 */
  const timeAnnouncementConfig = ref<TimeAnnouncementConfig>({
    enabled: true,           //是否允许整点报时
    startHour: 7,            //打开时间
    stopHour: 19,            //关闭时间
  })

  const greetingConfig = ref<GreetingConfig>({
    prompts:  getTtsPrompts(),
    model: 'qwen2.5:latest',
    apiUrl: '/ollama/v1/responses',
  })

  const ttsConfig = ref<TTSConfig>({
    apiUrl: '/tts/v1/audio/speech',
    voice: '中文女',
    response_format: 'wav',
    speed: 1.0,
  })

  const layoutConfig = ref({
    /** 仅显示时钟 */
    clockOnlyMode: false,
  })

  return {
    haLayout,
    haConfig,
    clockConfig,
    calendarConfig,
    timeAnnouncementConfig,
    greetingConfig,
    ttsConfig,
    layoutConfig,
    showDrawer,
    activeTab,
    language,
  }
}, {
  persist: {
    omit: ['showDrawer', 'activeTab'],
  },
})
