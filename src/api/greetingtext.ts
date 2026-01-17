//本地运行的Ollama服务
// 参数：
//   time 时间字符串，例如：2026/1/14 10:14:30 或 10:00
//   isNow: true 报时当前时间， false 整点报时
import type { OllamaResponse } from './types'
import type { GreetingConfig } from '../types'

export async function genGreetingText(time: string, isNow: boolean, greetingConfig: GreetingConfig): Promise<string> {
  const currTime = '当前时间:' + time + '。';
  const inputStr = currTime + (isNow ? greetingConfig.promptNow : greetingConfig.promptHours);
  console.log("prompts:", inputStr)
  try {
    const response = await fetch(greetingConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: greetingConfig.model,
        input: inputStr
      }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json() as OllamaResponse;
    const text = data.output[0].content[0].text;
    console.log("Text", text)
    return text;
  } catch (error) {
    console.error('Error fetching greeting text:', error);
  }
  return currTime;
}
