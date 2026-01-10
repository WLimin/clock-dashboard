<script setup lang="ts">
import { text } from 'stream/consumers';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

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

const showAvatar = ref(false);
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
        input: `生成30字的整点报时用的心情问候文本。当前时间为${time}`
      }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json() as OllamaResponse;
    const text=data.output[0].content[0].text;
    return text;

  } catch (error) {
    console.error('Error fetching greeting text:', error);
    return `当前时间为${time}`;
  }
}

const generateAndPlayTTS = async (text: string): Promise<Blob> => {
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
    return blob;
  } catch (error) {
    console.error('Error generating TTS:', error);
  }
}

const playAudio = async (audioBlob: Blob): Promise<void> => {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audioElement = document.createElement('audio');
  audioElement.src = audioUrl;
  audioElement.play();
};
    // const playAudio = async () => {
    //   if (!audioPlayer.value) return;

    //   const text = await fetchGreetingText();
    //   const audioFile = await generateTTS(text);

    //   if (audioFile) {
    //     audioPlayer.value.srcObject = audioFile;
    //     audioPlayer.value.play().catch(error => {
    //       console.error('Error playing audio:', error);
    //     });
    //   }
    // };

const updateTime = async () => {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentTime = `${currentHour}:00`;

  if (8 <= parseInt(currentHour) && parseInt(currentHour) < 19) {
    showAvatar.value = true;

    const greetingText = await fetchGreetingText(currentTime);
    generateAndPlayTTS(greetingText).then(blob => {
      playAudio(blob);
    });
  } else {
    showAvatar.value = false;
  }
}

onMounted(() => {
  updateTime();
  intervalId = setInterval(updateTime, 3600000); // Update every hour
})


onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
})
</script>
<template>
  <div v-if="showAvatar">
    ⏰️
    <!-- audio ref="audioPlayer"></audio -->
  </div>
</template>

<style scoped>
/* 添加一些样式 */
img {
  width: 100px;
  height: 100px;
}
</style>