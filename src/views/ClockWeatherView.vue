<script setup lang="ts">
import Digit from '../components/Digit.vue'
import Weather from '../components/Weather.vue'
import { useTime } from '../hooks/useTime'

const { h1, h2, m1, m2, s1, s2, lunar, now, showSeconds } = useTime()

function toggleSeconds() {
  showSeconds.value = !showSeconds.value
}
</script>

<template>
  <div class="glass-panel h-full p-4 md:p-8 flex flex-col items-center justify-between text-white w-full">
    <!-- 日期与农历 -->
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6 w-full justify-center pt-6">
      <div class="flex items-center gap-4">
        <div class="date-day-big">
          {{ now.getDate() }}
        </div>
        <div class="flex flex-col mt-2">
          <span class="text-5xl tracking-[0.2em] opacity-90 uppercase">
            {{ now.toLocaleDateString('zh-CN', { weekday: 'long' }) }}
          </span>
          <span class="text-4xl tracking-[0.2em] font-light opacity-70 mt-1">
            {{ now.getFullYear() }}年{{ now.getMonth() + 1 }}月
          </span>
        </div>
      </div>
      <div class="hidden md:block w-px h-16 mx-16 self-center" />
      <div class="flex flex-col items-center md:items-start mt-5" @click="$emit('showEggPreview')">
        <span class="text-5xl font-medium text-white/90 tracking-wider">{{ lunar.fullDate }}</span>
        <span class="text-4xl tracking-[0.2em] font-light opacity-70 mt-2">{{ lunar.year }}{{ lunar.month }}</span>
      </div>
    </div>

    <!-- 时钟显示 -->
    <div
      class="clock-display tabular-nums cursor-pointer transition-all duration-500"
      :class="{ 'with-seconds': showSeconds }"
      @click="toggleSeconds"
    >
      <Digit :value="h1" :show-seconds="showSeconds" :trigger="showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)" />
      <Digit :value="h2" :show-seconds="showSeconds" :trigger="showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)" />
      <!-- 根据时间值来改变分割符号:显示颜色。 -->
      <div class="clock-separator" :style="{ color: `rgb(${128 - (h1 * 10 + h2) * 5 + 10}, ${(m1 * 10 + s2) * 4 + 15}, ${(s1 * 10 + m2) * 4 + 15})` }">
        :
      </div>

      <Digit :value="m1" :show-seconds="showSeconds" :trigger="showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)" />
      <Digit :value="m2" :show-seconds="showSeconds" :trigger="showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)" />
      <div v-if="showSeconds" class="hidden md:block w-px mx-2 self-center" /> 
      <div v-if="showSeconds" class="flex flex-col mt-2">
        <!-- 将秒显示为1/3大小，两个数字排成1列，实现向上翻页效果。 -->
        <span class="flex flex-col items-center md:items-start mt-5">
          <div class="second-digit">&nbsp;</div>
          <template v-if="showSeconds">
            <Digit class="second-digit" :value="s1" :show-seconds="showSeconds" :trigger="now.getTime()" />
            <Digit class="second-digit" :value="s2" :show-seconds="showSeconds" :trigger="now.getTime()" />
          </template>
        </span>
       </div>
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
  font-family: 'Huninn', sans-serif;
  font-size: 35vw; /* iOS 12 Fallback 1: 响应式比例 */
  font-size: 22rem; /* iOS 12 Fallback 2: 强制大字号 */
  font-size: clamp(10rem, 35vw, 25rem);
  font-weight: 1000;
  line-height: 1.1;
  -webkit-text-stroke: 2px white; /* 恢复适中的描边加粗 */
}

.clock-display.with-seconds {
  font-size: 28vw; /* iOS 12 Fallback 1 */
}

.clock-separator {
  opacity: 1;
  text-align: center;
  margin: 0 -0.1em; /* 适当重叠，但比数字间距小 */
  font-weight: 700;
  display: flex;
  justify-content: center;
  line-height: 1;
  position: relative;
  top: -0.05em; /* 稍微上移一点，视觉上更垂直居中 */
}

.second-separator,
.second-digit {
  opacity: 0.6;
  font-size: 12vw; /* iOS 12 Fallback 1: 响应式比例 */
  font-size: 7rem; /* iOS 12 Fallback 2: 强制大字号 */
  align-content: center;
}
</style>
