import type { HAConfig } from '../types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
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
    /** 整点报时 */
    enableTimeAnnouncement: true,
  })

  const calendarConfig = ref({
    /** 一周的开始：0 为周日，1 为周一 */
    weekStartDay: 0,
  })

  return {
    haConfig,
    clockConfig,
    calendarConfig,
  }
}, {
  persist: true,
})
