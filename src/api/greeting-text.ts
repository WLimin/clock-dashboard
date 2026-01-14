export async function fetchGreetingText(time: string, isNow: boolean): Promise<string> {
  const prompt = '生成约50字，整点报时场景用，心灵鸡汤类文本，保留当前小时。'+`当前时间:${time}。`
  const promptNow = '生成约50字，语音报时场景用，和当前时间相关，能反映我心情或警言格句的文本。'+`当前时间:${time}。`
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
    return text;
  } catch (error) {
    console.error('Error fetching greeting text:', error);
    return `当前时间为${time}`;
  }
}
