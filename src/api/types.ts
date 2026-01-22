export interface WeatherApiResponse {
  current: {
    temperature_2m: number
    rain: number
    wind_speed_10m: number
    is_day: number
    apparent_temperature: number
    showers: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
  }
  hourly: {
    precipitation_probability: number[]
    uv_index: number[]
    temperature_2m: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
  }
  current_hour_index?: number
}

export interface AirQualityApiResponse {
  current: {
    us_aqi: number
  }
}

export interface NominatimSearchResult {
  name: string
  display_name: string
  lat: string
  lon: string
  address: {
    aeroway: string
    road: string
    city: string
    county: string
    state: string
    postcode: string
    country: string
    country_code: string
  }
}

export interface BigDataCloudLocationResponse {
  city?: string
  locality?: string
  principalSubdivision?: string
  latitude?: number
  longitude?: number
}

export interface CitySearchResult {
  name: string
  displayName: string
  latitude: number
  longitude: number
}

export interface HAEntityState {
  entity_id: string
  state: string
  attributes: Record<string, any>
  last_changed: string
  last_updated: string
}

export interface HAServiceCallParams {
  entity_id: string
  [key: string]: any
}

//Ollama服务API响应
export interface OllamaResponse {
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

export interface Coordinates {
  latitude: number
  longitude: number
}
