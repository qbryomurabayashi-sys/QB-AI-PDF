import React from 'react';
import { LayoutGrid, User, Sparkles, Wand2, Settings, Video, FileSpreadsheet, Plus, Film, ArrowUp, ArrowDown, Trash2, Download, Play, ChevronLeft, ChevronRight, FileText, Mic, Loader2, FileAudio, ChevronDown, Layers } from 'lucide-react';
import { VOICE_PROFILES } from '@/types';

export const StudioHeader = ({ settings, isGenerating, isExporting, hasSlides, hasAudio, isAnalyzing, onOpenSettings, onGenerateAll, onGenerateBatch, onOpenScriptGen, onExport, onDownloadAllAudio, onStop }) => {
    const [showGenMenu, setShowGenMenu] = React.useState(false);

    return (
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-md z-50">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <LayoutGrid size={16} className="text-white" />
                </div>
                <h1 className="text-lg font-bold tracking-tight">AIスライドスタジオ</h1>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <User size={12} className="text-indigo-400" />
                    <span className="text-[10px] font-medium text-white/60 tracking-wider uppercase">声: {VOICE_PROFILES.find(p => p.id === settings.voiceProfile)?.name}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex bg-[#121212] rounded-lg p-1 border border-white/5">
                    {(isGenerating || isAnalyzing) ? (
                        <button 
                            onClick={onStop}
                            className="flex items-center gap-2 px-6 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md text-xs font-bold transition-all animate-pulse"
                        >
                            <div className="w-2 h-2 bg-red-500 rounded-sm" />
                            <span>停止</span>
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={onOpenScriptGen}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/5 rounded-md text-xs font-semibold text-white/80 transition-all disabled:opacity-50"
                            >
                                <Sparkles size={14} className="text-indigo-400" />
                                <span>AI台本作成</span>
                            </button>
                            <div className="w-px bg-white/10 mx-1" />
                            <div className="relative">
                                <button 
                                    onClick={() => setShowGenMenu(!showGenMenu)}
                                    disabled={isGenerating}
                                    className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/5 rounded-md text-xs font-semibold text-white/80 transition-all disabled:opacity-50"
                                >
                                    <Wand2 size={14} className="text-[#FFD600]" />
                                    <span>音声を生成</span>
                                    <ChevronDown size={12} className={`transition-transform duration-200 ${showGenMenu ? 'rotate-180' : ''}`} />
                                </button>
                                {showGenMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[100]" onClick={() => setShowGenMenu(false)} />
                                        <div className="absolute top-full right-0 mt-2 w-64 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-[110] py-1 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                                            <button 
                                                onClick={() => { onGenerateBatch(1); setShowGenMenu(false); }}
                                                className="flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                            >
                                                <div className="p-1.5 bg-white/5 rounded-lg text-white/60">
                                                    <Wand2 size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">現在のスライド</div>
                                                    <div className="text-[10px] text-white/40">このスライドのみ生成</div>
                                                </div>
                                            </button>
                                            <button 
                                                onClick={() => { onGenerateBatch(3); setShowGenMenu(false); }}
                                                className="flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                            >
                                                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                                                    <Layers size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">次の3枚</div>
                                                    <div className="text-[10px] text-white/40">現在＋次の2枚を生成</div>
                                                </div>
                                            </button>
                                            <button 
                                                onClick={() => { onGenerateBatch(5); setShowGenMenu(false); }}
                                                className="flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                            >
                                                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                                                    <Layers size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">次の5枚</div>
                                                    <div className="text-[10px] text-white/40">現在＋次の4枚を生成</div>
                                                </div>
                                            </button>
                                            <div className="h-px bg-white/5 my-1" />
                                            <button 
                                                onClick={() => { onGenerateAll(); setShowGenMenu(false); }}
                                                className="flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                            >
                                                <div className="p-1.5 bg-[#FFD600]/10 rounded-lg text-[#FFD600]">
                                                    <Sparkles size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">未生成をすべて作成</div>
                                                    <div className="text-[10px] text-white/40">音声がないスライドのみ</div>
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="h-6 w-px bg-white/10" />

                <button onClick={onOpenSettings} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                    <Settings size={18} />
                </button>

                <div className="flex gap-2">
                    <button 
                        onClick={onDownloadAllAudio}
                        disabled={!hasAudio || isExporting}
                        title="すべての音声をダウンロード (ZIP)"
                        className="p-2 bg-[#121212] hover:bg-white/10 rounded-lg border border-white/5 text-white/60 hover:text-[#FFD600] transition-colors disabled:opacity-50 disabled:hover:text-white/60"
                    >
                        <FileAudio size={18} />
                    </button>
                    <button 
                        onClick={onExport}
                        disabled={isExporting || !hasAudio}
                        className="flex items-center gap-2 pl-4 pr-5 py-2 bg-white text-black rounded-full font-bold text-xs tracking-wide hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:shadow-none disabled:scale-100"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} fill="black" />}
                        <span>動画出力</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export const Sidebar = ({ slides, activeSlideIndex, onSetActive, onMoveSlide, onDeleteSlide, onDownloadAudio, onCsvImport, onImageAdd, onPdfUpload }) => {
    const [showImportMenu, setShowImportMenu] = React.useState(false);
    
    return (
        <aside className="w-24 md:w-64 bg-[#09090b] border-r border-white/5 flex flex-col z-20">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#09090b]">
                <span className="hidden md:block text-[10px] font-bold text-white/40 uppercase tracking-widest">ストーリーボード</span>
                <div className="flex gap-2">
                    <div className="relative">
                        <button 
                            onClick={() => setShowImportMenu(!showImportMenu)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white" 
                            title="台本をインポート"
                        >
                            <FileSpreadsheet size={14} />
                        </button>
                        {showImportMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowImportMenu(false)} />
                                <div className="absolute top-full left-0 mt-2 w-48 bg-[#18181b] border border-white/10 rounded-lg shadow-2xl z-50 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                                    <label className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer text-xs text-white/80">
                                        <FileSpreadsheet size={12} />
                                        <span>CSVから読み込む</span>
                                        <input type="file" className="hidden" accept=".csv" onChange={(e) => { onCsvImport(e, 'csv'); setShowImportMenu(false); }} />
                                    </label>
                                    <label className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer text-xs text-white/80">
                                        <FileText size={12} />
                                        <span>テキストから読み込む</span>
                                        <input type="file" className="hidden" accept=".txt" onChange={(e) => { onCsvImport(e, 'txt'); setShowImportMenu(false); }} />
                                    </label>
                                    <label className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer text-xs text-white/80">
                                        <LayoutGrid size={12} />
                                        <span>JSONから読み込む</span>
                                        <input type="file" className="hidden" accept=".json" onChange={(e) => { onCsvImport(e, 'json'); setShowImportMenu(false); }} />
                                    </label>
                                </div>
                            </>
                        )}
                    </div>
                    <label className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md cursor-pointer transition-colors text-white/60 hover:text-white" title="スライドを追加">
                        <Plus size={14} />
                        <input type="file" className="hidden" accept="image/*" onChange={onImageAdd} />
                    </label>
                    <label className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md cursor-pointer transition-colors text-white/60 hover:text-white" title="PDFをインポート">
                        <Film size={14} />
                        <input type="file" className="hidden" accept=".pdf" onChange={onPdfUpload} />
                    </label>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                {slides.map((s, i) => (
                    <div key={s.id} className="relative group">
                        <div className="flex items-center gap-3 mb-1 px-1">
                            <span className={`text-[10px] font-mono font-bold ${activeSlideIndex === i ? 'text-[#FFD600]' : 'text-white/20'}`}>{(i + 1).toString().padStart(2, '0')}</span>
                            {s.audio && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />}
                        </div>
                        <button 
                            onClick={() => onSetActive(i)}
                            className={`relative w-full aspect-video rounded-lg overflow-hidden border transition-all duration-300 group-hover:scale-[1.02] ${activeSlideIndex === i 
                                ? 'border-[#FFD600] shadow-[0_0_20px_rgba(255,214,0,0.15)] ring-1 ring-[#FFD600]/20' 
                                : 'border-white/5 hover:border-white/20 opacity-60 hover:opacity-100'}`}
                        >
                            <img src={s.image} className="w-full h-full object-cover" alt="" />
                            {s.isGenerating && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <Loader2 size={20} className="animate-spin text-[#FFD600]" />
                                </div>
                            )}
                            {s.isAnalyzing && (
                                <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <Sparkles size={20} className="animate-pulse text-white" />
                                </div>
                            )}
                        </button>
                        {/* 操作ボタン */}
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-full z-10 pl-2">
                            <button onClick={(e) => { e.stopPropagation(); onMoveSlide(i, 'up'); }} disabled={i === 0} className="p-1.5 bg-[#18181b] border border-white/10 text-white/60 hover:text-white rounded-md shadow-xl">
                                <ArrowUp size={12} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onMoveSlide(i, 'down'); }} disabled={i === slides.length - 1} className="p-1.5 bg-[#18181b] border border-white/10 text-white/60 hover:text-white rounded-md shadow-xl">
                                <ArrowDown size={12} />
                            </button>
                            {s.audio && (
                                <button onClick={(e) => { e.stopPropagation(); onDownloadAudio(s, i); }} className="p-1.5 bg-[#18181b] border border-white/10 text-white/60 hover:text-[#FFD600] rounded-md shadow-xl" title="音声をダウンロード">
                                    <Download size={12} />
                                </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onDeleteSlide(i); }} className="p-1.5 bg-red-900/80 border border-red-500/30 text-red-200 hover:text-white rounded-md shadow-xl">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all text-white/20 hover:text-white/60">
                    <Plus size={20} />
                    <span className="text-[10px] mt-2 font-bold uppercase tracking-widest">スライドを追加</span>
                    <input type="file" className="hidden" accept="image/*" onChange={onImageAdd} />
                </label>
            </div>
        </aside>
    );
};

export const Stage = ({ activeSlide, activeSlideIndex, totalSlides, bgmSrc, settings, onPrev, onNext }) => {
    const audioRef = React.useRef(null);
    const bgmRef = React.useRef(null);

    return (
        <div className="flex-1 relative flex flex-col min-h-0">
            <audio ref={bgmRef} src={bgmSrc || undefined} loop />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#18181b_0%,#000000_100%)]" />
            
            <div className="relative flex-1 flex items-center justify-center p-8 md:p-12 overflow-hidden">
                <div className="relative max-w-full max-h-full aspect-video shadow-2xl rounded-lg border border-white/5 bg-black group transition-transform duration-500">
                    {activeSlide && <img src={activeSlide.image} className="w-full h-full object-contain rounded-lg" alt="" />}
                    
                    {activeSlide?.audio && (
                        <audio 
                            ref={audioRef} 
                            src={activeSlide.audio} 
                            onPlay={() => {
                                if (bgmRef.current && bgmSrc) {
                                    bgmRef.current.volume = settings.bgmVolume;
                                    bgmRef.current.play();
                                }
                            }}
                            onPause={() => {
                                if (bgmRef.current) {
                                    bgmRef.current.pause();
                                }
                            }}
                            onEnded={() => {
                                if (bgmRef.current) {
                                    bgmRef.current.pause();
                                }
                            }}
                        />
                    )}

                    <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${activeSlide?.audio ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
                        <button 
                            onClick={() => {
                                if (audioRef.current) {
                                    audioRef.current.currentTime = 0;
                                    audioRef.current.play();
                                }
                            }}
                            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xl"
                        >
                            <Play fill="white" size={32} className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ナビゲーション */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-3 bg-[#18181b]/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl z-30">
                <button onClick={onPrev} disabled={activeSlideIndex === 0} className="text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <span className="text-sm font-mono font-medium text-white/60 tracking-wider">
                    {activeSlideIndex + 1} <span className="text-white/20">/</span> {totalSlides}
                </span>
                <button onClick={onNext} disabled={activeSlideIndex === totalSlides - 1} className="text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export const ScriptEditor = ({ activeSlide, activeSlideIndex, settings, onScriptChange, onTtsScriptChange, onToggleTtsMode, onGenerateAudio, onDownloadAudio, onGenerateSingleScript }) => {
    return (
        <div className="h-[320px] bg-[#09090b] border-t border-white/5 flex flex-col z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090b]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                        <FileText size={14} />
                        <span>ナレーション原稿</span>
                    </div>
                    <button 
                        onClick={onGenerateSingleScript}
                        disabled={activeSlide?.isAnalyzing}
                        className="text-[10px] flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded hover:bg-indigo-500/20 transition-colors"
                    >
                        <Sparkles size={10} /> このスライドのみ生成
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">読み上げモード</span>
                        <button 
                            onClick={onToggleTtsMode}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${activeSlide?.useTtsScript ? 'bg-[#FFD600]' : 'bg-white/10'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-black shadow-sm transform transition-transform ${activeSlide?.useTtsScript ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onGenerateAudio}
                            disabled={activeSlide?.isGenerating}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs font-bold text-white transition-all disabled:opacity-50"
                        >
                            {activeSlide?.isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />}
                            {activeSlide?.audio ? '再生成' : '音声を生成'}
                        </button>
                        {activeSlide?.audio && (
                            <button 
                                onClick={onDownloadAudio}
                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white/60 hover:text-[#FFD600] transition-colors"
                                title={`音声をダウンロード (${settings.audioDownloadFormat.toUpperCase()})`}
                            >
                                <Download size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1 flex p-6 gap-6 min-h-0 bg-[#09090b]">
                {/* メイン原稿 */}
                <div className={`flex-1 flex flex-col relative transition-all duration-300 ${activeSlide?.useTtsScript ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}>
                    <textarea 
                        value={activeSlide?.script || ""}
                        onChange={(e) => onScriptChange(e.target.value)}
                        className="flex-1 bg-transparent text-sm md:text-base text-white/90 leading-relaxed resize-none focus:outline-none placeholder-white/20 font-medium custom-scrollbar"
                        placeholder="ナレーション原稿をここに入力してください..."
                    />
                    {!activeSlide?.useTtsScript && (
                        <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_lime]" />
                    )}
                </div>

                {/* TTS上書き */}
                {activeSlide?.useTtsScript && (
                    <>
                        <div className="w-px bg-white/10" />
                        <div className="flex-1 flex flex-col relative animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="mb-2 flex justify-between items-center">
                                <span className="text-[10px] text-[#FFD600] font-bold uppercase tracking-wide">読み上げ用テキスト (フリガナ等)</span>
                                <div className="w-2 h-2 rounded-full bg-[#FFD600] shadow-[0_0_10px_#FFD600]" />
                            </div>
                            <textarea 
                                value={activeSlide?.ttsScript || ""}
                                onChange={(e) => onTtsScriptChange(e.target.value)}
                                className="flex-1 bg-[#121212] rounded-xl p-4 text-sm text-[#FFD600] leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[#FFD600]/30 placeholder-white/20 font-mono custom-scrollbar border border-white/5"
                                placeholder="読み上げ専用のテキストを入力（例：固有名詞の読み方など）..."
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
