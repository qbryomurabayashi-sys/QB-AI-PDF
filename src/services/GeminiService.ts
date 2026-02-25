import { GoogleGenAI, Modality } from "@google/genai";
import { VOICE_PROFILES } from '@/types';
import { pcmToWav, sleep } from '@/utils';

// Primary key from environment (GEMINI_API_KEY is default, API_KEY is from user selection)
const RAW_KEYS = [
    process.env.API_KEY,
    process.env.GEMINI_API_KEY
];

// Filter out invalid keys and duplicates to ensure clean rotation
const API_KEYS = Array.from(new Set(RAW_KEYS.filter(k => !!k && k !== 'PLACEHOLDER_API_KEY')));

export class GeminiService {
    /**
     * Executes an API operation with key rotation and retry logic.
     * If the primary key fails (e.g. quota), it switches to the next key.
     */
    static async withKeyRotation(operation) {
        let lastError;
        
        if (API_KEYS.length === 0) {
            throw new Error("No valid API Key found. Please set GEMINI_API_KEY in your environment.");
        }

        for (let i = 0; i < API_KEYS.length; i++) {
            const apiKey = API_KEYS[i];
            const isLastKey = i === API_KEYS.length - 1;

            try {
                const ai = new GoogleGenAI({ apiKey });
                // Attempt the operation with internal retries for transient server errors (503)
                return await this.retryTransient(() => operation(ai));
            } catch (error: any) {
                // Log warning but don't expose full key in logs
                console.warn(`API attempt failed with key index ${i} (${error.message || error})`);
                lastError = error;

                // Check if error is related to quota (429) or other rotate-able errors
                const isQuotaError = error.status === 429 || error.code === 429 || (error.message && error.message.includes('429'));
                
                // Handle key selection error
                if (error.message && error.message.includes("Requested entity was not found")) {
                    console.error("API Key selection error. Prompting user to re-select.");
                    if (window.aistudio) {
                        await window.aistudio.openSelectKey();
                    }
                }

                // If not the last key, switch to the next one
                if (!isLastKey) {
                    console.log("Switching to fallback API key...");
                    // If it was a quota error, switch immediately. If it was a server error that failed retries, also switch.
                    await sleep(500); // Brief cooldown
                    continue;
                }
            }
        }
        throw lastError;
    }

    // Internal retry for transient errors on a SINGLE key (e.g. 503 Service Unavailable)
    static async retryTransient(fn, retries = 2, initialDelay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error: any) {
                // If 429 (Quota), don't retry locally, let the key rotation handle it immediately
                if (error.status === 429 || error.code === 429 || (error.message && error.message.includes('429'))) {
                    throw error;
                }

                const isServerOverload = error.status === 503 || error.code === 503;
                if (isServerOverload && i < retries - 1) {
                    const delay = initialDelay * Math.pow(2, i);
                    await sleep(delay);
                    continue;
                }
                throw error;
            }
        }
        throw new Error("Max retries exceeded");
    }

    static async generateScript(imageBase64, purpose) {
        const systemPrompt = `
    あなたは世界最高峰の日本人ナレーターであり、プレゼンテーションの脚本家です。
    提供されたスライド画像を分析し、聴衆の心に響き、自然に流れる洗練された「語り（口語）」の日本語ナレーション原稿を作成してください。

    【重要：日本語出力のガイドライン】
    1. **完全な語り口調**: 「〜であります」「〜と考えられます」といった書き言葉は厳禁です。「〜ですね」「〜ます」「〜でしょうか？」といった、自然に語りかける口調を使ってください。
    2. **句読点と間**: 日本語ネイティブ（L1話者）特有の「間（ま）」や「溜め」をTTSエンジンが再現できるよう、句読点を意図的に配置してください。
    3. **語彙の選択**: 翻訳調の不自然な日本語（例：「それは私にとって〜を思い出させます」）を避け、文脈に応じた自然な接続詞（「実は」「ここでの注目ポイントは」）を使用してください。
    4. **構成**: スライドの文字をなぞるだけではなく、そのスライドが伝えたい「メッセージ」を補完・補強する内容にしてください。
    5. **長さ**: 30秒〜45秒程度（約150〜250文字）を基準にしてください。

    出力はMarkdownなどの装飾を含まない、純粋なテキストのみの１行で行ってください。
    `;

        const userPrompt = `
    プレゼンテーションの目的/ターゲット: ${purpose}
    
    このスライドのナレーション原稿を作成してください。
    `;

        return this.withKeyRotation(async (ai) => {
            const response = await ai.models.generateContent({
                model: this.VISION_MODEL,
                config: {
                    systemInstruction: systemPrompt,
                },
                contents: {
                    parts: [
                        { text: userPrompt },
                        { inlineData: { mimeType: "image/png", data: imageBase64 } }
                    ]
                }
            });

            let text = response.text || "";
            // Clean up any markdown that might have slipped through
            return text.replace(/\*\*/g, '').replace(/^#+\s/gm, '').replace(/`/g, '').trim();
        });
    }

    static async generateAudio(text, voiceProfileId) {
        const profile = VOICE_PROFILES.find(p => p.id === voiceProfileId) || VOICE_PROFILES[0];

        return this.withKeyRotation(async (ai) => {
            const response = await ai.models.generateContent({
                model: this.TTS_MODEL,
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: profile.geminiVoice }
                        }
                    }
                }
            });

            const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!audioData) throw new Error("No audio data received from API");

            return pcmToWav(audioData);
        });
    }

    // Use Gemini 3 Flash Preview for multimodal text tasks (Slide -> Text)
    static VISION_MODEL = 'gemini-3-flash-preview';
    // Use Gemini 2.5 Flash Preview TTS for Audio
    static TTS_MODEL = 'gemini-2.5-flash-preview-tts';
}
