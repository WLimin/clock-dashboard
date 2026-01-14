<script setup lang="ts">
import { Loader2, Wifi, WifiOff } from 'lucide-vue-next'
import { ref } from 'vue'
import { haSocket } from '../../api/ha-websocket'

const props = defineProps<{
  url: string
  token: string
}>()

const isTestingConnection = ref(false)
const connectionStatus = ref<'idle' | 'success' | 'error'>('idle')
const connectionMessage = ref('')

async function testConnection() {
  if (!props.url || !props.token) {
    connectionStatus.value = 'error'
    connectionMessage.value = '请填写 HA 地址和访问令牌'
    alert(connectionMessage.value)
    return
  }

  isTestingConnection.value = true
  connectionStatus.value = 'idle'
  connectionMessage.value = ''

  try {
    await haSocket.connect(props.url, props.token)
    connectionStatus.value = 'success'
    connectionMessage.value = '连接成功！'
    alert(connectionMessage.value)
  }
  catch (error: any) {
    connectionStatus.value = 'error'
    connectionMessage.value = error?.message || '连接失败，请检查地址和令牌是否正确'
    alert(connectionMessage.value)
  }
  finally {
    isTestingConnection.value = false
  }
}
</script>

<template>
  <button
    class="flex items-center gap-2 text-blue-400"
    :class="{
      'text-green-400': connectionStatus === 'success',
      'text-red-400': connectionStatus === 'error',
    }"
    :disabled="isTestingConnection"
    @click="testConnection"
  >
    <component
      :is="isTestingConnection ? Loader2 : connectionStatus === 'success' ? Wifi : connectionStatus === 'error' ? WifiOff : Wifi"
      class="w-4 h-4"
      :class="{
        'animate-spin': isTestingConnection,
      }"
    />
    <span class="text-sm">测试连接</span>
  </button>
</template>
