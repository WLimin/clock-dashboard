import type { TTSConfig } from '../types'

export async function genTts(inputtext: string, ttsConfig: TTSConfig): Promise<Blob> {
    console.log("GenerateTts")
    try {
        const response = await fetch(ttsConfig.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: inputtext,
                voice: ttsConfig.voice,
                response_format: ttsConfig.response_format,
                speed: ttsConfig.speed
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
    }
    return new Blob;
}