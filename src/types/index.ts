export interface HAConfig {
  url: string
  token: string
  entities: HAEntity[]
}

export interface HAEntity {
  id: string
  name: string
}

export interface WeatherInfo {
  text: string
  icon?: string
}

export interface LunarInfo {
  month: string // 正月、冬月、闰二月
  date: string // 初一、十五
  year: string // 乙巳
  yearShengxiao: string // 蛇
  monthGanzhi: string // 己丑
  dayGanzhi: string // 乙酉
  isFestival: boolean
  festival?: string
  holiday?: string // 如：休、班
  yi?: string[] // 宜
  ji?: string[] // 忌
  chong?: string // 冲
  sha?: string // 煞
  wuxing?: string // 五行
  pengzu?: string[] // 彭祖百忌
  hours?: {
    hour: string // 时辰 (如: 子时)
    ganzhi: string // 干支 (如: 甲子)
    luck: string // 吉凶 (如: 吉/凶)
    tianShen: string // 天神 (如: 青龙)
    js: string // 宜
    xs: string // 忌
  }[]
}

export interface GreetingConfig { //报时配置接口
  promptHours: { [key: string]: string }; //整点报时提示词
  promptNow: { [key: string]: string };   //当前时间提示词
  model: string;                          //使用的大语言模型名，例如：qwen2.5:latest
  apiUrl: string;                         //openai兼容的ollama api接口地址，例如：http://172.18.0.160:11434/v1/responses
}

export interface TTSConfig { //TTS 配置接口
  apiUrl: string;           //openai兼容的 api接口地址，例如：http://172.18.0.180:8000/v1/audio/speech
  voice: string;            //'中文女'
  response_format: string;  //'wav'
  speed: number;            //1.0
}

export interface TimeAnnouncementConfig { //语音报时设置
  enabled: boolean;         //是否允许整点报时
  startHour: number;        //打开时间
  stopHour: number;         //关闭时间
}