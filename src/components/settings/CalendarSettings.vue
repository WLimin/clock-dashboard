<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useConfigStore } from '../../stores/config'

const configStore = useConfigStore()
const { calendarConfig } = storeToRefs(configStore)

const calendarDraft = ref({ ...calendarConfig.value })

function save() {
  calendarConfig.value = { ...calendarDraft.value }
}

function reset() {
  calendarDraft.value = { ...calendarConfig.value }
}

defineExpose({ save, reset })
</script>

<template>
  <div class="space-y-10 animate-fade-in">
    <section>
      <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
        每周开始于
      </h4>
      <div class="grid grid-cols-2 gap-4">
        <button
          class="settings-tab-btn"
          :class="{ active: calendarDraft.weekStartDay === 1 }"
          @click="calendarDraft.weekStartDay = 1"
        >
          星期一
        </button>
        <button
          class="settings-tab-btn"
          :class="{ active: calendarDraft.weekStartDay === 0 }"
          @click="calendarDraft.weekStartDay = 0"
        >
          星期日
        </button>
      </div>
    </section>

    <section>
      <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
        显示设置
      </h4>
      <div
        class="settings-toggle-card"
        :class="{ active: calendarDraft.showHolidays }"
        @click="calendarDraft.showHolidays = !calendarDraft.showHolidays"
      >
        <span class="font-medium">显示法定节假日</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
    </section>
  </div>
</template>
