<script setup lang="ts">
// 整点语音报时。
// 需要本地ollama部署的qwen2.5及cosy-voice支持。

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '../stores/config'
import { genGreetingText } from '../api/greetingtext'
import { genTts } from '../api/generatetts'

const configStore = useConfigStore()
const { clockConfig, greetingConfig, ttsConfig } = storeToRefs(configStore)

const props = defineProps<{
  doTimeAnnouce: boolean
}>()

watch(() => props.doTimeAnnouce, (isTimeAnnouce) => {
  if (isTimeAnnouce) {
    announceTimeNow()
  }
})

const showAvatar = ref('💤');
const audioPlayer = ref<HTMLAudioElement | null>(null);

let audioFile: Blob = new Blob;
let intervalId: NodeJS.Timeout | null = null;
//下面3个用于决定Avatar图标
let inPlayAudio: boolean = false;
let inGenText: boolean = false;
let inGenTts: boolean = false;

const fetchGreetingText = async (time: string, isNow: boolean): Promise<string> => {
  inGenText = true;
  const greetingText = await genGreetingText(time, isNow, greetingConfig.value);
  inGenText = false;
  return greetingText;
}

const generateTTS = async (text: string): Promise<Blob> => {
  inGenTts = true;
    const blob = await genTts(text, ttsConfig.value);
    inGenTts = false;
    return blob;
}

const playAudio = async (audioBlob: Blob): Promise<void> => {
  console.log("playAudio")
  if (!audioPlayer.value) {
    return;
  }
  if (audioBlob.size === 0) {
    return;
  }
  const audioUrl = URL.createObjectURL(audioBlob);
  audioPlayer.value.src = audioUrl;
  audioPlayer.value.play().catch(error => {
    console.error('Error playing audio:', error);
  });
};

// 生成整点报时的语音，等待播放
const announceTime = async (time: string): Promise<void> => {
  console.log("announceTime:", time)
  const greetingText = await fetchGreetingText(time, false);
  generateTTS(greetingText).then(blob => { audioFile = blob })
};

const announceTimeNow = () => {
  const currentTime = new Date();
  const timeStr = currentTime.toLocaleString();
  console.log("announceTimeNow:", timeStr)

  setTimeout(async () => {
    const greetingText = await fetchGreetingText(timeStr, true);
    generateTTS(greetingText).then(blob => { playAudio(blob) })
  }, 1 * 1000); // 1秒后执行
}
onMounted(() => {
  intervalId = setInterval(() => {
    const t = new Date();
    const hNow = t.getHours()
    const mNow = t.getMinutes()
    const sNow = t.getSeconds()

    // 是自动报时时段  
    const isTimeAnnounce = ((clockConfig.value.enableTimeAnnouncement) && (8 <= hNow && hNow < 19))
    //提前4分钟生成整点报时内容(只用CPU生成文本大约2分钟，合成语音1分钟)
    const isTimeGenAnnounce = (mNow === 56 && sNow === 0)
    //整点报时
    const isHourMatch = (mNow === 59 && sNow === 58)
    if (isTimeAnnounce) {
      if (isTimeGenAnnounce) {
        const currentTime = `${hNow + 1}:00`;
        setTimeout(() => {
          announceTime(currentTime);
        }, 2 * 1000); // 2秒后执行
      }
      if (isHourMatch) {
        setTimeout(() => {
          playAudio(audioFile)
        }, 1000); // 1秒后执行
      }
    }
    if (isTimeAnnounce) {
      showAvatar.value = '🔊';
    } else {
      showAvatar.value = '💤';
    }
    if (inGenText) {
      showAvatar.value = '🤔';
    }
    if (inGenTts) {
      showAvatar.value = '💬';
    }
    if (inPlayAudio) {
      showAvatar.value = '🎺';
    }
  }, 1000); // Update every Seconed
  //安装事件钩子，更新图标
  const audio = document.querySelector("audio");
  if (audio) {
    audio.onplay = () => {
      inPlayAudio = true;
    };
    audio.onpause = () => {
      inPlayAudio = false;
    };
  }
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
})
</script>
<template>
  <div class="avatar" @click.native="announceTimeNow">
    &nbsp;{{ showAvatar }}
    <audio ref="audioPlayer"></audio>
  </div>
</template>

<style scoped>
.avatar {
  font-size: min(20rem, 24vw);
}
</style>