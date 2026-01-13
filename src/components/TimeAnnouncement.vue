<script setup lang="ts">
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
let inPlayAudio: boolean = false;
let inGenText: boolean = false;
let inGenTts: boolean = false;

const fetchGreetingText = async (time: string, isNow: boolean): Promise<string> => {
  inGenText = true;
  const prompt = `生成约50字的整点报时用的心情祝福场景文本，保留当前小时。当前时间为${time}`
  const promptNow = `当前时间为${time}。报时，并生成约50字，和当前时间相关的心情场景文本。`
  let inputStr = isNow ? promptNow : prompt;
  try {
    const response = await fetch('http://172.18.0.160:11434/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:latest',
        input: inputStr
      }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json() as OllamaResponse;
    const text = data.output[0].content[0].text;
    console.log("Text", text)
    inGenText = false;
    return text;

  } catch (error) {
    console.error('Error fetching greeting text:', error);
    inGenText = false;
    return `当前时间为${time}`;
  }
}

const generateTTS = async (text: string): Promise<Blob> => {
  console.log("GenerateTts")
  inGenTts = true;
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
    inGenTts = false;
    return blob;
  } catch (error) {
    console.error('Error generating TTS:', error);
    inGenTts = false;
    return new Blob;
  }
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
    const monthNow = t.getMonth()
    const dateNow = t.getDate()
    const hNow = t.getHours()
    const mNow = t.getMinutes()
    const sNow = t.getSeconds()

    // 是自动报时时段  
    const isTimeAnnounce = ((clockConfig.value.enableTimeAnnouncement) && (8 <= hNow && hNow < 19))
    //提前4分钟生成整点报时内容(只用CPU生成文本大约2分钟，合成语音1分钟)
    const isTimeGenAnnounce = (mNow === 56 && sNow === 0)
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
    {{ showAvatar }}
    <audio ref="audioPlayer"></audio>
  </div>
</template>

<style scoped>
.avatar {
  font-size: min(20rem, 24vw);
}
</style>