import type { HAConfig, GreetingConfig, TTSConfig } from '../types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
  const showDrawer = ref(false)
  const activeTab = ref<'clock' | 'ttsllm' | 'weather' | 'calendar' | 'smart'>('clock')

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

  const enableTimeAnnouncement = ref(true)      /** 整点报时 */

  const greetingConfig = ref<GreetingConfig>({
    promptHours: '生成约50字，整点报时场景用，心灵鸡汤类文本，保留当前小时。',
    promptNow: '报出时间。生成约50字，语音报时场景用，和当前时间相关，能反映我心情的诗词或警言格句的文本。',
    model: 'qwen2.5:latest',
    apiUrl: 'http://172.18.0.160:11434/v1/responses',
  })

  const ttsConfig = ref<TTSConfig>({
    apiUrl: 'http://172.18.0.180:8000/v1/audio/speech',
    voice: '中文女',
    response_format: 'wav',
    speed: 1.0,
  })

  return {
    haConfig,
    clockConfig,
    calendarConfig,
    enableTimeAnnouncement,
    greetingConfig,
    ttsConfig,
    showDrawer,
    activeTab,
  }
}, {
  persist: {
    omit: ['showDrawer', 'activeTab'],
  },
})
