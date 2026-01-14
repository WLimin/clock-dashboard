<script setup lang="ts">
import type { DailyWeatherApiResponse } from '../api/types'
import { X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { fetchDailyWeatherData } from '../api/weather'
import { useWeatherStore } from '../stores/weather'
import { mapWmoCode } from '../utils/weather'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const weatherStore = useWeatherStore()
const { locationText } = storeToRefs(weatherStore)
const dailyWeatherData = ref<DailyWeatherApiResponse | null>(null)
const loading = ref(false)

const forecastDays = computed(() => {
  if (!dailyWeatherData.value) return []

  const { daily } = dailyWeatherData.value
  return daily.time
    .slice(1, 6)
    .map((time, index) => {
      const date = new Date(time)
      const isTomorrow = index === 0
      const isDayAfterTomorrow = index === 1

      const dayName = isTomorrow
        ? '明天'
        : isDayAfterTomorrow
          ? '后天'
          : ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]

      const dateText = `${date.getMonth() + 1}/${date.getDate()}`
      const actualIndex = index + 1
      const weatherInfo = mapWmoCode(daily.weather_code[actualIndex], true)

      return {
        dayName,
        dateText,
        weatherInfo,
        tempMax: Math.round(daily.temperature_2m_max[actualIndex]),
        tempMin: Math.round(daily.temperature_2m_min[actualIndex]),
        precipitationProbability: daily.precipitation_probability_max[actualIndex] || 0,
      }
    })
})

const tempRange = computed(() => {
  if (forecastDays.value.length === 0) return { min: 0, max: 0, range: 0 }

  const allTemps = forecastDays.value.flatMap(day => [day.tempMin, day.tempMax])
  const min = Math.min(...allTemps)
  const max = Math.max(...allTemps)
  const range = max - min

  return { min, max, range }
})

function getTempBarPosition(tempMin: number, tempMax: number) {
  const { min, range } = tempRange.value
  if (range === 0) return { left: 0, width: 100 }

  const left = ((tempMin - min) / range) * 100
  const width = ((tempMax - tempMin) / range) * 100

  return { left, width }
}

async function loadForecast() {
  loading.value = true
  try {
    const { lat, lon } = await weatherStore.getCurrentCoords()
    dailyWeatherData.value = await fetchDailyWeatherData(lat, lon)
  }
  catch (error) {
    console.error('Failed to load forecast:', error)
  }
  finally {
    loading.value = false
  }
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    loadForecast()
  }
})

onMounted(() => {
  if (props.show) {
    loadForecast()
  }
})

function handleClose() {
  emit('close')
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      @click.stop.prevent="handleOverlayClick"
      @mousedown.stop
      @mouseup.stop
      @touchstart.stop
      @touchend.stop
    >
      <div
        class="max-h-[80vh] flex flex-col relative bg-neutral-900 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border border-white/10"
      >
        <!-- 关闭按钮 -->
        <button
          class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:rotate-90 duration-300"
          @click.stop.prevent="handleClose"
        >
          <X class="w-6 h-6 text-white" />
        </button>

        <!-- 标题 -->
        <div class="px-8 pt-8 pb-6">
          <h2 class="text-3xl font-bold text-white flex items-center gap-2">
            <span>未来5天预报</span>
            <span class="text-white/40">·</span>
            <span class="text-white/60 text-2xl">{{ locationText }}</span>
          </h2>
        </div>

        <!-- 天气列表 -->
        <div class="px-8 pb-8 overflow-y-auto">
          <!-- 骨架屏 -->
          <div v-if="loading" class="space-y-3">
            <div
              v-for="i in 5"
              :key="`skeleton-${i}`"
              class="flex items-center justify-between gap-6 py-2 px-6 rounded-2xl bg-white/5"
            >
              <!-- 左侧骨架 -->
              <div class="flex items-center gap-4 flex-1">
                <!-- 日期骨架 -->
                <div class="flex flex-col gap-2 min-w-[70px]">
                  <div class="h-6 w-16 bg-white/10 rounded animate-pulse" />
                  <div class="h-4 w-12 bg-white/10 rounded animate-pulse" />
                </div>

                <!-- 天气图标和描述骨架 -->
                <div class="flex flex-col gap-2 flex-1">
                  <div class="flex items-center gap-3">
                    <div class="w-16 h-16 bg-white/10 rounded-full animate-pulse flex-shrink-0" />
                    <div class="flex flex-col gap-2 flex-1">
                      <div class="h-5 w-20 bg-white/10 rounded animate-pulse" />
                      <div class="h-4 w-24 bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右侧温度骨架 -->
              <div class="flex items-center gap-3 min-w-[240px]">
                <div class="h-5 w-10 bg-white/10 rounded animate-pulse" />
                <div class="flex-1 h-2 bg-white/10 rounded-full animate-pulse" />
                <div class="h-5 w-10 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>

          <!-- 实际数据 -->
          <div v-else class="space-y-3">
            <div
              v-for="(day, index) in forecastDays"
              :key="index"
              class="flex items-center justify-between gap-6 py-2 px-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300"
            >
              <!-- 左侧：日期、天气、降雨 -->
              <div class="flex items-center gap-4 flex-1">
                <!-- 日期 -->
                <div class="flex flex-col items-start min-w-[70px]">
                  <span class="text-xl font-semibold text-white">{{ day.dayName }}</span>
                  <span class="text-sm text-white/60">{{ day.dateText }}</span>
                </div>

                <!-- 天气图标和描述 -->
                <div class="flex flex-col gap-2 flex-1">
                  <div class="flex items-center gap-3">
                    <img
                      :src="day.weatherInfo.icon"
                      :alt="day.weatherInfo.text"
                      class="w-16 h-16 object-contain flex-shrink-0"
                      draggable="false"
                    >
                    <div class="flex flex-col">
                      <span class="text-lg text-white/90">{{ day.weatherInfo.text }}</span>
                      <!-- 降雨概率 -->
                      <span class="text-sm text-blue-400 tabular-nums">降雨 {{ day.precipitationProbability }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右侧：温度区间条 -->
              <div class="flex items-center gap-3 min-w-[240px]">
                <span class="text-lg font-medium text-blue-300 tabular-nums w-10 text-right">{{ day.tempMin }}°</span>

                <!-- 温度区间条 -->
                <div class="relative flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    class="absolute h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full transition-all duration-500"
                    :style="{
                      left: `${getTempBarPosition(day.tempMin, day.tempMax).left}%`,
                      width: `${getTempBarPosition(day.tempMin, day.tempMax).width}%`,
                    }"
                  />
                </div>

                <span class="text-lg font-medium text-orange-400 tabular-nums w-10 text-left">{{ day.tempMax }}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
