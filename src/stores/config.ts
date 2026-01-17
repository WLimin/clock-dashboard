import type { HAConfig, GreetingConfig, TTSConfig, TimeAnnouncementConfig } from '../types'
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

  /** 整点报时 */
  const timeAnnouncementConfig = ref<TimeAnnouncementConfig>({
    enabled: true,           //是否允许整点报时
    startHour: 7,            //打开时间
    stopHour: 19,            //关闭时间
  })

  const greetingConfig = ref<GreetingConfig>({
    promptHours: '首先口语念出当前时间，不要包括分和秒，到整点即可。格式举例：现在10点整。然后，念出约50字，和当前时间相关场景的诗词或警言，有出处，但无需解释含义。',
    promptNow: '首先口语念出当前时间，不要包括秒，到分钟即可，格式举例：当前时间是4月5日星期一10点10分。若分钟数为0,则格式改为点整，例如10时0分，发音为10点整。然后，念出约50字，和当前时间相关场景的诗词或警言，明确出处前不要添加破折号，但无需解释含义。',
    model: 'qwen2.5:latest',
    apiUrl: '/ollama/v1/responses',
  })

  const ttsConfig = ref<TTSConfig>({
    apiUrl: '/tts/v1/audio/speech',
    voice: '中文女',
    response_format: 'wav',
    speed: 1.0,
  })

  return {
    haConfig,
    clockConfig,
    calendarConfig,
    timeAnnouncementConfig,
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
