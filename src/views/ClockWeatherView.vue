<script setup lang="ts">
import { useIdle } from '@vueuse/core'
import { Settings } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import Digit from '../components/Digit.vue'
import Weather from '../components/Weather.vue'
import { useTime } from '../hooks/useTime'
import { useConfigStore } from '../stores/config'
import TimeAnnouncement from '../components/TimeAnnouncement.vue'

const configStore = useConfigStore()
const { clockConfig, showDrawer, activeTab } = storeToRefs(configStore)

const { h1, h2, m1, m2, s1, s2, lunar, now } = useTime({
  is24Hour: computed(() => clockConfig.value.is24Hour),
})

const announceTimeNow = ref(false)

function openSettings() {
  activeTab.value = 'clock'
  showDrawer.value = true
}

function toggleSeconds() {
  clockConfig.value.showSeconds = !clockConfig.value.showSeconds
}

const baseDelay = computed(() => {
  return clockConfig.value.showSeconds ? 0 : -2
})

const trigTalkTimeNow = () => {
  announceTimeNow.value = !announceTimeNow;
  setTimeout(() => {
    announceTimeNow.value = false
  }, 5 * 1000); // 5秒后执行
}

/** 闲置时隐藏设置按钮 */
const showSettingsButton = ref(true)
const { idle } = useIdle(5 * 1000)
watch(idle, (newIdle) => {
  showSettingsButton.value = !newIdle
})
</script>

<template>
  <div
    class="glass-panel relative h-full flex flex-col items-center justify-evenly text-white w-full overflow-y-auto overflow-x-hidden"
    @click.stop="showSettingsButton = !showSettingsButton"
  >
    <!-- 设置按钮 -->
    <button
      :class="{ 'opacity-0': !showSettingsButton }"
      class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:rotate-90 duration-300" @click="openSettings"
    >
      <Settings class="w-6 h-6 text-white" />
    </button>

    <!-- 日期与农历 -->
    <div class="flex flex-col sm:flex-row items-center md:items-start gap-0 sm:gap-6 w-full justify-center">
      <div class="flex items-center gap-4">
        <div class="date-day-big">
          {{ now.getDate() }}
        </div>
        <div class="flex flex-col mt-2">
          <span class="text-5xl tracking-[0.2em] opacity-90 uppercase">
            {{ now.toLocaleDateString('zh-CN', { weekday: 'long' }) }}
          </span>
          <span class="text-4xl tracking-[0.2em] font-light opacity-70 mt-2">
            {{ now.getFullYear() }}年{{ now.getMonth() + 1 }}月
          </span>
        </div>
      </div>
      <div class="hidden md:block w-px h-16 mx-8 self-center" />
      <div class="sm:h-32 flex flex-row-reverse sm:flex-col items-center sm:items-start justify-center" @click.native="$emit('showEggPreview')">
       <span class="text-4xl sm:text-5xl opacity-70 sm:opacity-90 tracking-wider sm:mt-2">{{ lunar.fullDate }}</span>
        <span class="text-4xl tracking-[0.2em] font-light opacity-70 sm:mt-2">{{ lunar.year }}({{ lunar.yearShengxiao }})年{{ lunar.month }}月</span>
      </div>
    </div>

    <!-- 时钟显示 -->
    <div
      class="clock-display tabular-nums cursor-pointer transition-all duration-500"
      :class="{ 'with-seconds': clockConfig.showSeconds }"
      :style="{ color: clockConfig.color, fontWeight: clockConfig.fontWeight, opacity: clockConfig.opacity }"
      @click.stop.prevent="toggleSeconds"
    >
      <Digit
        v-if="clockConfig.is24Hour || h1 !== 0"
        :value="h1" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(5 - baseDelay) * 100"
        class="opacity-95"
      />
      <Digit
        :value="h2" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(4 - baseDelay) * 100"
        class="opacity-95"
        :class="[{
          brightness: clockConfig.is24Hour || (!clockConfig.is24Hour && h1 !== 0),
        }]"
      />
      <!-- 根据时间值来改变分割符号:显示颜色。 -->
      <div class="clock-separator" :style="{ color: `rgb(${128 - (h1 * 10 + h2) * 5 + 10}, ${(m1 * 10 + s2) * 4 + 15}, ${(s1 * 10 + m2) * 4 + 15})` }">
        :
      </div>
      <Digit
        :value="m1" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(3 - baseDelay) * 100"
        class="opacity-95"
      />
      <Digit
        :value="m2" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(2 - baseDelay) * 100"
        class="opacity-95 brightness"
      />

      <template v-if="clockConfig.showSeconds" >
        <div class="hidden md:block w-px mx-2 self-center" />
        <div class="flex flex-col mt-2" >
          <!-- 将秒显示为1/3大小，两个数字排成1列，实现向上翻页效果。 -->
          <span class="flex flex-col items-center md:items-start mt-5" >
            <div class="second-digit opacity-60" style="font-size: 14%">&nbsp;</div>
            <Digit
              class="second-digit opacity-60" :value="s1" :show-seconds="clockConfig.showSeconds"
              :trigger="now.getTime()" 
              :delay="100" :enable-tilt="clockConfig.enableTilt"
            />
            <Digit
              class="second-digit brightness opacity-60" :value="s2" :show-seconds="clockConfig.showSeconds"
              :trigger="now.getTime()" 
              :delay="0" :enable-tilt="clockConfig.enableTilt"
            />
          </span>
        </div>
      </template>

      <div class="hidden md:block w-px mx-2 self-center" />
      <span class="flex flex-col items-center md:items-start mt-5" @click.stop.prevent="trigTalkTimeNow">
        <TimeAnnouncement style="font-size: 14%" :doTimeAnnouce="announceTimeNow" />
        <div class="second-digit opacity-60" style="font-size: 12%">&nbsp;</div>
        <div class="second-digit opacity-60" style="font-size: 12%">&nbsp;</div>
      </span>
    </div>

    <!-- 天气展示 -->
    <Weather />
  </div>
</template>

<style scoped>
.glass-panel {
  max-width: 1200px;
}

.date-day-big {
  font-size: 8rem; /* iOS 12 Fallback: 约 80px */
  line-height: 1;
  font-weight: 800;
  background: linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.clock-display {
  display: flex;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center;
  justify-content: center;
  font-family: 'SFCompactRounded', 'Huninn', sans-serif;
  font-size: min(26rem, 46vw);
  -webkit-text-stroke: 2px white; /* 恢复适中的描边加粗 */
}

.clock-display.with-seconds {
  font-size: min(22rem, 28vw);
}

.clock-separator {
  font-size: 95%;
  opacity: 0.98;
  text-align: center;
  margin: 0 -0.08em; /* 适当重叠，但比数字间距小 */
  display: flex;
  justify-content: center;
  line-height: 0.8em;
  position: relative;
  top: -0.05em; /* 稍微上移一点，视觉上更垂直居中 */
  z-index: 10;
  filter: brightness(1.8);
}

.second-separator,
.second-digit {
  opacity: 0.6;
  align-content: center;
  font-family: 'SFCompactRounded', 'Huninn', sans-serif;
  font-size: 28%;
  }

.brightness {
  filter: brightness(1.25);
}
</style>
