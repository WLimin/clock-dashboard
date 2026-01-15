<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useConfigStore } from '../../stores/config'

const configStore = useConfigStore()
const { greetingConfig, ttsConfig, timeAnnouncementConfig } = storeToRefs(configStore)

const draftGreeting = ref({ ...greetingConfig.value })
const draftTts = ref({ ...ttsConfig.value })
const draftTimeAnnouncementConfig = ref({ ...timeAnnouncementConfig.value })

function save() {
  greetingConfig.value = { ...draftGreeting.value }
  ttsConfig.value = { ...draftTts.value }
  timeAnnouncementConfig.value = { ...draftTimeAnnouncementConfig.value }
}

function reset() {
  draftGreeting.value = { ...greetingConfig.value }
  draftTts.value = { ...ttsConfig.value }
  draftTimeAnnouncementConfig.value = { ...timeAnnouncementConfig.value }
}

defineExpose({ save, reset })
</script>
<template>
  <div class="space-y-10 animate-fade-in">
    <section>
      <div class="settings-toggle-card" :class="{ active: draftTimeAnnouncementConfig.enabled }"
        @click="draftTimeAnnouncementConfig.enabled = !draftTimeAnnouncementConfig.enabled">
        <span class="font-medium">整点报时</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
      </section>
      <section>
        <section>
          <div class="flex justify-between items-center mb-6">
            <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
              打开时间 </h4>
            <span class="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/80">{{draftTimeAnnouncementConfig.startHour }}</span>
          </div>
          <input v-model.number="draftTimeAnnouncementConfig.startHour" type="range" min="0" max="23" step="1" class="settings-range">
          <div class="flex justify-between mt-3 text-[10px] text-white/20 font-mono">
            <span v-for="w in [0, 5, 10, 15, 20]" :key="w">{{ w }}</span>
          </div>
        </section>

        <section>
          <div class="flex justify-between items-center mb-6">
            <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
              关闭时间 </h4>
            <span class="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/80">{{draftTimeAnnouncementConfig.stopHour }}</span>
          </div>
          <input v-model.number="draftTimeAnnouncementConfig.stopHour" type="range" min="0" max="23" step="1" class="settings-range">
          <div class="flex justify-between mt-3 text-[10px] text-white/20 font-mono">
            <span v-for="w in [0, 5, 10, 15, 20]" :key="w">{{ w }}</span>
          </div>
        </section>
    </section>

    <section>
      <h3 class="text-white/90 mb-4 uppercase tracking-widest text-sm font-medium">
        报时文本生成
      </h3>
      <section>
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
        <input v-model="draftGreeting.promptHours" type="text" placeholder="整点报场景用的大语言模型提示符文本。"
          class="settings-input" />
      </section>
      <section>
        <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
          语音报时模板
        </h4>
        <input v-model="draftGreeting.promptNow" type="text" placeholder="语音报时场景用的大语言模型提示符文本。"
          class="settings-input" />
      </section>
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
      <input v-model="draftTts.response_format" type="text" placeholder="wav" class="settings-input" />

      <section>
        <div class="flex justify-between items-center mb-6">
          <h4 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
            速度
          </h4>
          <span class="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/80">{{ draftTts.speed }}</span>
        </div>
        <input v-model.number="draftTts.speed" type="range" min="0.5" max="2.0" step="0.1" class="settings-range">
        <div class="flex justify-between mt-3 text-[10px] text-white/20 font-mono">
          <span v-for="w in [0.5, 1.0, 1.5, 2.0]" :key="w">{{ w }}</span>
        </div>
      </section>
    </section>
  </div>
</template>
