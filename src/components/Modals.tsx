import { useState } from 'react';
import { Sparkles, MonitorPlay } from 'lucide-react';
import { VOICE_PROFILES } from '@/types';

export const ResumeModal = ({ isOpen, onResume, onNew }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="max-w-md w-full text-center space-y-8 p-8 border border-white/10 rounded-2xl bg-[#09090b] shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto ring-1 ring-indigo-500/20">
                    <Sparkles className="text-indigo-400" size={32} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">セッションを復元しますか？</h2>
                    <p className="text-white/50 text-sm leading-relaxed">
                        前回の未保存のセッションが見つかりました。中断したところから再開しますか？
                    </p>
                </div>
                <div className="grid gap-3">
                    <button onClick={onResume} className="w-full py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-xl">
                        セッションを復元
                    </button>
                    <button onClick={onNew} className="w-full py-3.5 bg-white/5 text-white/60 hover:text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                        新しく始める
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ScriptGenModal = ({ isOpen, onClose, onConfirm }) => {
    const [purpose, setPurpose] = useState("");
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">AI脚本アシスタント</h3>
                        <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Gemini 3 Flash</p>
                    </div>
                </div>
                <div className="space-y-2 mb-8">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wide">ターゲット視聴者やプレゼンの目的を入力してください</label>
                    <textarea 
                        value={purpose}
                        onChange={e => setPurpose(e.target.value)}
                        className="w-full h-32 bg-[#121212] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none transition-all placeholder-white/20"
                        placeholder="例：ビジネスエグゼクティブ向けの新規事業提案、または小学生向けの科学実験の解説動画など..."
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors rounded-xl hover:bg-white/5">
                        キャンセル
                    </button>
                    <button 
                        onClick={() => onConfirm(purpose)}
                        disabled={!purpose.trim()}
                        className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        台本を一括生成
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SettingsModal = ({ isOpen, onClose, settings, onSave, onBgmUpload, bgmName }) => {
    const [local, setLocal] = useState(settings);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#09090b] border border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full h-[80vh] flex overflow-hidden animate-in zoom-in-95 duration-300">
                {/* サイドバー */}
                <div className="w-64 bg-[#050505] border-r border-white/5 p-6 flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-white tracking-tight mb-6 px-2">設定</h3>
                    {['音声', 'オーディオ & ビデオ', 'APIキー'].map((item, i) => (
                        <div 
                            key={item}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${i === 0 ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'} transition-all`}
                        >
                            {item}
                        </div>
                    ))}
                </div>

                {/* コンテンツ */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                        <section>
                            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">APIキー設定</h4>
                            <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-sm font-bold text-white">独自のAPIキーを使用する</h5>
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            無料枠の制限（429エラー）を回避したり、より高性能なモデルを使用するには、ご自身のGoogle CloudプロジェクトのAPIキーを選択してください。
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={async () => {
                                        if (window.aistudio) {
                                            await window.aistudio.openSelectKey();
                                        }
                                    }}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    APIキーを選択 / 変更
                                </button>
                                <p className="text-[10px] text-white/30 text-center">
                                    ※ 有料プロジェクトのAPIキーが必要です。<br/>
                                    詳細は <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">こちら（公式ドキュメント）</a> を参照してください。
                                </p>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">ナレーションの声</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {VOICE_PROFILES.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => setLocal({ ...local, voiceProfile: p.id })}
                                        className={`group relative p-4 rounded-xl border text-left transition-all ${local.voiceProfile === p.id ? 'bg-white/10 border-[#FFD600] ring-1 ring-[#FFD600]/20' : 'bg-[#121212] border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`font-bold text-sm ${local.voiceProfile === p.id ? 'text-[#FFD600]' : 'text-white'}`}>{p.name}</span>
                                            {local.voiceProfile === p.id && <div className="w-2 h-2 rounded-full bg-[#FFD600] shadow-[0_0_8px_#FFD600]" />}
                                        </div>
                                        <div className="text-[10px] text-white/40 mb-3">{p.description}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {p.tags.map(t => (
                                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/5">{t}</span>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">音声ダウンロード形式</h4>
                            <div className="flex gap-4">
                                <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${local.audioDownloadFormat === 'wav' ? 'bg-white/10 border-[#FFD600]' : 'bg-[#121212] border-white/5'}`}>
                                    <input type="radio" className="hidden" name="format" checked={local.audioDownloadFormat === 'wav'} onChange={() => setLocal({...local, audioDownloadFormat: 'wav'})} />
                                    <span className="text-sm font-bold text-white">WAV</span>
                                    <span className="text-[10px] text-white/40">高音質 / ファイル大</span>
                                </label>
                                <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${local.audioDownloadFormat === 'mp3' ? 'bg-white/10 border-[#FFD600]' : 'bg-[#121212] border-white/5'}`}>
                                    <input type="radio" className="hidden" name="format" checked={local.audioDownloadFormat === 'mp3'} onChange={() => setLocal({...local, audioDownloadFormat: 'mp3'})} />
                                    <span className="text-sm font-bold text-white">MP3</span>
                                    <span className="text-[10px] text-white/40">圧縮 / ファイル小</span>
                                </label>
                            </div>
                        </section>

                        <section className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold text-white/60">
                                    <span>再生速度</span>
                                    <span>{local.voiceSpeed}x</span>
                                </div>
                                <input 
                                    type="range" min="0.7" max="1.5" step="0.1" 
                                    value={local.voiceSpeed} 
                                    onChange={e => setLocal({...local, voiceSpeed: parseFloat(e.target.value)})}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-[#FFD600] cursor-pointer"
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold text-white/60">
                                    <span>スライド間の余白</span>
                                    <span>{local.slideGap}s</span>
                                </div>
                                <input 
                                    type="range" min="0" max="5.0" step="0.5" 
                                    value={local.slideGap} 
                                    onChange={e => setLocal({...local, slideGap: parseFloat(e.target.value)})}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-[#FFD600] cursor-pointer"
                                />
                            </div>
                        </section>

                        <section>
                            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">背景音楽 (BGM)</h4>
                            <label className="flex items-center justify-between p-4 border border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-full text-white/40 group-hover:text-white transition-colors">
                                        <MonitorPlay size={16} />
                                    </div>
                                    <div className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                                        {bgmName || 'クリックしてオーディオファイルをアップロード (MP3/WAV)'}
                                    </div>
                                </div>
                                <input type="file" className="hidden" accept="audio/*" onChange={e => e.target.files?.[0] && onBgmUpload(e.target.files[0])} />
                                <span className="text-xs font-bold text-[#FFD600] opacity-0 group-hover:opacity-100 transition-opacity">アップロード</span>
                            </label>
                        </section>
                    </div>

                    <div className="p-6 border-t border-white/5 flex justify-end gap-4 bg-[#050505]">
                        <button onClick={onClose} className="px-6 py-2 text-white/40 font-bold text-xs hover:text-white transition-colors">
                            キャンセル
                        </button>
                        <button 
                            onClick={() => { onSave(local); onClose(); }}
                            className="px-8 py-2.5 bg-white text-black rounded-full font-bold text-xs tracking-wide hover:scale-105 transition-all"
                        >
                            設定を保存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
