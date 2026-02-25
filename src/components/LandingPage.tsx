import { Loader2, Upload, Plus } from 'lucide-react';

export const LandingPage = ({ loading, onPdfUpload, onImageAdd }) => {
    return (
        <div className="min-h-[100dvh] bg-[#000000] text-white flex flex-col relative overflow-hidden font-['Plus_Jakarta_Sans']">
            {/* 背景エフェクト */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center space-y-12">
                <div className="space-y-6 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="w-2 h-2 rounded-full bg-[#FFD600] animate-pulse" />
                        <span className="text-xs font-semibold tracking-widest uppercase text-white/60">AI Slide Studio v2.2</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 animate-in zoom-in-95 duration-1000">
                        静寂は、<br />
                        <span className="text-indigo-500">黄金。</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        静止画スライドを、Gemini AIで映画のようなプレゼン動画へ。<br />
                        日本語ネイティブの自然な語りを、あなたの資料に。
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                    <label className="group relative cursor-pointer">
                        <input type="file" className="hidden" accept=".pdf" onChange={onPdfUpload} />
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500" />
                        <div className="relative flex items-center gap-4 px-10 py-5 bg-[#0A0A0A] rounded-full border border-white/10 group-hover:bg-black transition-all">
                            {loading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-[#FFD600]" />}
                            <span className="text-lg font-bold tracking-wider">PDFをアップロード</span>
                        </div>
                    </label>

                    <label className="group relative cursor-pointer">
                        <input type="file" className="hidden" accept="image/*" onChange={onImageAdd} />
                        <div className="relative flex items-center gap-4 px-10 py-5 bg-[#0A0A0A] rounded-full border border-white/10 group-hover:bg-white/5 transition-all">
                            <Plus className="text-white/60" />
                            <span className="text-lg font-bold tracking-wider text-white/60">画像を追加</span>
                        </div>
                    </label>
                </div>
                
                <div className="pt-12 animate-in fade-in duration-1000 delay-500">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Powered by Gemini 3 Flash & 2.5 Flash TTS</p>
                </div>
            </div>
        </div>
    );
};
