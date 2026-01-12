<script setup lang="ts">
import { text } from 'stream/consumers';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '../stores/config'

const configStore = useConfigStore()
const { clockConfig } = storeToRefs(configStore)

interface OllamaResponse {
  id: string;
  object: string;
  created_at: number;
  status: string;
  model: string;
  output: {
    id: string;
    type: string;
    status: string;
    role: string;
    content: {
      type: string;
      text: string;
    }[];
  }[];
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

interface TTSResponse {
  url: string;
}

const showAvatar = ref('🐓');
const audioPlayer = ref<HTMLAudioElement | null>(null);

let audioFile: Blob = new Blob;
let intervalId: NodeJS.Timeout | null = null;

const fetchGreetingText = async (time: string): Promise<string> => {
  try {
    const response = await fetch('http://172.18.0.160:11434/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:latest',
        input: `生成约50字的整点报时用的心情祝福场景文本，保留当前小时。当前时间为${time}`
      }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json() as OllamaResponse;
    const text=data.output[0].content[0].text;
    console.log("Text",text)
    return text;

  } catch (error) {
    console.error('Error fetching greeting text:', error);
    return `当前时间为${time}`;
  }
}

const generateTTS = async (text: string): Promise<Blob> => {
  console.log("GenerateTts")
  try {
    const response = await fetch('http://172.18.0.180:8000/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        voice: '中文女',
        response_format: 'wav',
        speed: 1.0
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const blob = await response.blob();
    console.log("GenerateTts done!")
    return blob;
  } catch (error) {
    console.error('Error generating TTS:', error);
    return new Blob;
  }
}

const playAudio = async (audioBlob: Blob): Promise<void> => {
  console.log("playAudio")
  if (!audioPlayer.value) {
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
  console.log("announceTime")
  const greetingText = await fetchGreetingText(time);
  generateTTS(greetingText).then(blob => { audioFile = blob })
};

function announceTimeNow() {
  console.log("announceTimeNow")
  const currentTime = new Date();
  setTimeout(async () => {
    const greetingText = await fetchGreetingText(currentTime.toLocaleString());
    generateTTS(greetingText).then(blob => { playAudio(blob) })
  }, 1 * 1000); // 1秒后执行
}
onMounted(() => {
  intervalId = setInterval(() => {
    const t = new Date();
    const monthNow = t.getMonth()
    const dateNow = t.getDate()
    const hNow = t.getHours()
    const mNow = t.getMinutes()
    const sNow = t.getSeconds()

    // 是自动报时时段  
    const isTimeAnnounce = ((clockConfig.value.enableTimeAnnouncement) && (8 <= hNow && hNow < 19))
    //提前5分钟生成整点报时内容(只用CPU生成文本大约2分钟，合成语音1分钟)
    const isTimeGenAnnounce = (mNow === 55 && sNow === 0)
    const isHourMatch = (mNow === 59 && sNow === 55)
    if (isTimeAnnounce) {
      showAvatar.value = '🐓';
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
    } else {
      showAvatar.value = '⏰️';
    }
  }, 1000); // Update every Seconed
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
})
</script>
<template>
  <div @click.native="announceTimeNow">
    {{ showAvatar }}
    <audio ref="audioPlayer"></audio>
  </div>
</template>

<style scoped>
/* 添加一些样式 */
img {
  width: 100px;
  height: 100px;
}
</style>