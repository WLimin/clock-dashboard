<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useConfigStore } from '../../stores/config'

const configStore = useConfigStore()
const { greetingConfig, ttsConfig, enableTimeAnnouncement } = storeToRefs(configStore)

const draftGreeting = ref({ ...greetingConfig.value })
const draftTts = ref({ ...ttsConfig.value })
const draftEnableTimeAnnouncement = ref(enableTimeAnnouncement.value)

function save() {
  greetingConfig.value = { ...draftGreeting.value }
  ttsConfig.value = { ...draftTts.value }
  enableTimeAnnouncement.value = draftEnableTimeAnnouncement.value
}

function reset() {
  draftGreeting.value = { ...greetingConfig.value }
  draftTts.value = { ...ttsConfig.value }
  draftEnableTimeAnnouncement.value = enableTimeAnnouncement.value
}

defineExpose({ save, reset })
</script>

<template>
  <div class="space-y-10 animate-fade-in">
    <section>
      <div class="settings-toggle-card" :class="{ active: draftEnableTimeAnnouncement }"
        @click="draftEnableTimeAnnouncement = !draftEnableTimeAnnouncement">
        <span class="font-medium">整点报时</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
    </section>
    <section>
      <h3 class="text-white/90 mb-4 uppercase tracking-widest text-sm font-medium">
        报时文本生成
      </h3>

      <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
        Ollama API服务地址
      </h4>
      <input v-model="draftGreeting.apiUrl" type="text" placeholder="http://172.18.0.160:11434/v1/responses"
        class="settings-input" />
    </section>
    <section>
      <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
        大模型名称
      </h4>
      <input v-model="draftGreeting.model" type="text" placeholder="qwen2.5:latest" class="settings-input" />
    </section>
    <section>
      <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
        整点报时模板
      </h4>
      <input v-model="draftGreeting.promptHours" type="text" placeholder="生成约50字，整点报时场景用，心灵鸡汤类文本，保留当前小时。"
        class="settings-input" />
    </section>
    <section>
      <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
        语音报时模板
      </h4>
      <input v-model="draftGreeting.promptNow" type="text" placeholder="生成约50字，语音报时场景用，和当前时间相关，能反映我心情或警言格句的文本。"
        class="settings-input" />
    </section>

    <section>
      <h3 class="text-white/90 mb-4 uppercase tracking-widest text-sm font-medium">
        文本转语音
      </h3>
      <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
        OpenAI兼容 TTS API服务地址
      </h4>
      <input v-model="draftTts.apiUrl" type="text" placeholder="http://172.18.0.180:8000/v1/audio/speech"
        class="settings-input" />

      <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
        音色
      </h4>
      <input v-model="draftTts.voice" type="text" placeholder="中文女" class="settings-input" />

      <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
        响应MIME类型
      </h4>
      <input v-model="draftTts.response_format" type="text" placeholder="中文女" class="settings-input" />
      <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
        速度
      </h4>
      <input v-model.number="draftTts.speed" type="range" min="0.5" max="2.0" step="0.1" class="settings-range">
      <div class="flex justify-between mt-3 text-[10px] text-white/20 font-mono">
        <span>0.5</span>
        <span>1.0</span>
        <span>1.5</span>
        <span>2.0</span>
      </div>
    </section>
  </div>
</template>
