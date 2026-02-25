export const VOICE_PROFILES = [
    { id: 'v1', name: 'Zephyr', geminiVoice: 'Zephyr', description: '落ち着きのあるプロフェッショナルな男性の声', tags: ['フォーマル', 'ナレーション', '解説'] },
    { id: 'v2', name: 'Kore', geminiVoice: 'Kore', description: '温かみのあるエネルギッシュな女性の声', tags: ['元気', 'プロフェッショナル', '朗読'] },
    { id: 'v3', name: 'Fenrir', geminiVoice: 'Fenrir', description: '深く威厳のある男性の声', tags: ['重厚', 'ドラマチック', '信頼'] },
    { id: 'v4', name: 'Puck', geminiVoice: 'Puck', description: '遊び心のあるフレンドリーな女性の声', tags: ['カジュアル', '会話', '物語'] },
    { id: 'v5', name: 'Charon', geminiVoice: 'Charon', description: '安定感のある信頼できる声', tags: ['ニュース', '報告', '実直'] }
];

declare global {
    interface Window {
        aistudio: {
            hasSelectedApiKey: () => Promise<boolean>;
            openSelectKey: () => Promise<void>;
        };
    }
}
