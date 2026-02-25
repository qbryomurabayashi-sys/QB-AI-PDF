import { useState, useEffect, useRef } from 'react';
import { sleep, downloadAudioFile, convertToMp3 } from '@/utils';
import { GeminiService } from '@/services/GeminiService';
import { ExportService } from '@/services/ExportService';
import { StorageService } from '@/services/StorageService';
import { LandingPage } from '@/components/LandingPage';
import { ScriptGenModal, SettingsModal, ResumeModal } from '@/components/Modals';
import { StudioHeader, Sidebar, Stage, ScriptEditor } from '@/components/Studio';
import JSZip from 'jszip';

export default function App() {
    const [slides, setSlides] = useState<any[]>([]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showScriptGenModal, setShowScriptGenModal] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const [settings, setAppSettings] = useState({
        bgmVolume: 0.1,
        fontFamily: 'sans-serif',
        voiceProfile: 'v1',
        voiceSpeed: 1.0,
        exportFormat: 'mp4',
        audioDownloadFormat: 'wav',
        subtitleColor: '#FFFFFF',
        subtitleBgColor: '#000000',
        slideGap: 1.5
    });

    const [bgmSrc, setBgmSrc] = useState<string | null>(null);
    const [bgmName, setBgmName] = useState("");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stopFlag = useRef(false);

    // Check for saved session on mount
    useEffect(() => {
        const checkSession = async () => {
            const hasSession = await StorageService.hasSession();
            if (hasSession) {
                setShowResumeModal(true);
            } else {
                setIsInitialized(true);
            }
        };
        checkSession();
    }, []);

    // Auto-save effect
    useEffect(() => {
        if (!isInitialized) return;
        const saveTimeout = setTimeout(() => {
            StorageService.saveSession(slides, settings, activeSlideIndex, bgmSrc, bgmName)
                .catch(err => console.error("Auto-save failed:", err));
        }, 2000); // Save after 2 seconds of inactivity
        return () => clearTimeout(saveTimeout);
    }, [slides, settings, activeSlideIndex, bgmSrc, bgmName, isInitialized]);

    useEffect(() => {
        const sPdf = document.createElement("script");
        sPdf.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        document.body.appendChild(sPdf);

        const sLame = document.createElement("script");
        sLame.src = "https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js";
        document.body.appendChild(sLame);
    }, []);

    const handleResumeSession = async () => {
        setLoading(true);
        try {
            const session = await StorageService.loadSession() as any;
            if (session) {
                setSlides(session.slides);
                setAppSettings(session.settings);
                setActiveSlideIndex(session.activeSlideIndex);
                setBgmSrc(session.bgmSrc);
                setBgmName(session.bgmName);
            }
        } catch (e) {
            console.error("Failed to load session", e);
            alert("前回のセッションを復元できませんでした。");
        } finally {
            setLoading(false);
            setShowResumeModal(false);
            setIsInitialized(true);
        }
    };

    const handleNewSession = async () => {
        await StorageService.clearSession();
        setShowResumeModal(false);
        setIsInitialized(true);
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const pdfjsLib = (window as any).pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

            const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
            const newImages = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const vp = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                canvas.height = vp.height;
                canvas.width = vp.width;
                await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
                newImages.push(canvas.toDataURL('image/png'));
            }

            const newSlides = newImages.map(img => ({
                id: crypto.randomUUID(),
                image: img,
                script: "",
                ttsScript: "",
                useTtsScript: false,
                audio: null,
                isGenerating: false,
                isAnalyzing: false
            }));

            setSlides(prev => [...prev, ...newSlides]);
        } catch (err) {
            alert("PDFの読み込みに失敗しました。");
        } finally {
            setLoading(false);
        }
    };

    const handleImageAdd = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                const newSlide = {
                    id: crypto.randomUUID(),
                    image: ev.target.result as string,
                    script: "",
                    ttsScript: "",
                    useTtsScript: false,
                    audio: null,
                    isGenerating: false,
                    isAnalyzing: false
                };
                const newSlides = [...slides];
                const insertIndex = slides.length > 0 ? activeSlideIndex + 1 : 0;
                newSlides.splice(insertIndex, 0, newSlide);
                setSlides(newSlides);
                setActiveSlideIndex(insertIndex);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCsvImport = async (e, format = 'csv') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const newScripts: any = {};

            if (format === 'csv') {
                const rows = text.split(/\r?\n/);
                rows.forEach(row => {
                    if (!row.trim()) return;
                    const firstCommaIndex = row.indexOf(',');
                    if (firstCommaIndex === -1) return;

                    const pageNumStr = row.substring(0, firstCommaIndex).trim();
                    let scriptContent = row.substring(firstCommaIndex + 1).trim();

                    const pageNum = parseInt(pageNumStr.replace(/['"]/g, ""), 10);
                    if (scriptContent.startsWith('"') && scriptContent.endsWith('"')) {
                        scriptContent = scriptContent.slice(1, -1).replace(/""/g, '"');
                    }

                    if (!isNaN(pageNum) && pageNum > 0) {
                        newScripts[pageNum] = scriptContent;
                    }
                });
            } else if (format === 'txt') {
                // Assume one script per paragraph (double newline) or per line
                const paragraphs = text.split(/\n\s*\n/);
                paragraphs.forEach((p, i) => {
                    if (p.trim()) newScripts[i + 1] = p.trim();
                });
            } else if (format === 'json') {
                const data = JSON.parse(text);
                if (Array.isArray(data)) {
                    data.forEach((item, i) => {
                        const script = typeof item === 'string' ? item : (item.script || item.text);
                        if (script) newScripts[i + 1] = script;
                    });
                } else if (typeof data === 'object') {
                    Object.entries(data).forEach(([key, val]) => {
                        const pageNum = parseInt(key, 10);
                        const script = typeof val === 'string' ? val : ((val as any).script || (val as any).text);
                        if (!isNaN(pageNum) && script) newScripts[pageNum] = script;
                    });
                }
            }

            if (Object.keys(newScripts).length > 0) {
                setSlides(prev => prev.map((s, i) => {
                    const pageNum = i + 1;
                    if (newScripts[pageNum]) return { ...s, script: newScripts[pageNum], audio: null };
                    return s;
                }));
                alert(`${Object.keys(newScripts).length} 件の台本をインポートしました。`);
            }
        } catch (err) {
            alert("インポートに失敗しました。ファイル形式を確認してください。");
        }
        e.target.value = '';
    };

    const moveSlide = (idx, dir) => {
        const nextIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (nextIdx < 0 || nextIdx >= slides.length) return;
        const newSlides = [...slides];
        [newSlides[idx], newSlides[nextIdx]] = [newSlides[nextIdx], newSlides[idx]];
        setSlides(newSlides);
        setActiveSlideIndex(nextIdx);
    };

    const deleteSlide = (idx) => {
        if (!window.confirm("このスライドを削除しますか？")) return;
        if (slides.length <= 1) {
            setSlides([]);
            return;
        }
        const newSlides = slides.filter((_, i) => i !== idx);
        setSlides(newSlides);
        if (idx === activeSlideIndex) {
            setActiveSlideIndex(Math.max(0, idx - 1));
        } else if (idx < activeSlideIndex) {
            setActiveSlideIndex(activeSlideIndex - 1);
        }
    };

    const generateScripts = async (purpose) => {
        stopFlag.current = false;
        // Process sequentially to avoid rate limits
        for (let i = 0; i < slides.length; i++) {
            if (stopFlag.current) {
                alert("生成を停止しました。");
                break;
            }
            setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, isAnalyzing: true } : s));
            try {
                const base64Image = slides[i].image.split(',')[1];
                const script = await GeminiService.generateScript(base64Image, purpose);
                setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, script: script, isAnalyzing: false, audio: null } : s));
            } catch (e: any) {
                console.error(e);
                // If it's a quota error, stop the loop to prevent further failures
                if (e.status === 429 || e.code === 429 || (e.message && e.message.includes('429'))) {
                    alert(`クォータ制限に達しました。スライド ${i + 1} で停止します。しばらく待ってから再試行してください。`);
                    setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, isAnalyzing: false } : s));
                    break;
                }
                alert(`スライド ${i + 1} の台本生成に失敗しました: ${e.message}`);
                setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, isAnalyzing: false } : s));
            }
            // Increased delay to 1.5s to prevent rate limits
            await sleep(1500);
        }
    };

    const generateSingleScript = async () => {
        const purpose = window.prompt("ターゲット視聴者や目的を入力してください（例：ビジネスエグゼクティブ向け）:", "フォーマルなビジネスプレゼンテーション");
        if (!purpose) return;

        const idx = activeSlideIndex;
        setSlides(prev => prev.map((s, i) => i === idx ? { ...s, isAnalyzing: true } : s));
        try {
            const base64Image = slides[idx].image.split(',')[1];
            const script = await GeminiService.generateScript(base64Image, purpose);
            setSlides(prev => prev.map((s, i) => i === idx ? { ...s, script: script, isAnalyzing: false, audio: null } : s));
        } catch (e: any) {
            console.error(e);
            alert(`台本生成に失敗しました: ${e.message}`);
            setSlides(prev => prev.map((s, i) => i === idx ? { ...s, isAnalyzing: false } : s));
        }
    };

    const generateAudio = async (idx) => {
        const slide = slides[idx];
        const textToUse = (slide.useTtsScript && slide.ttsScript.trim()) ? slide.ttsScript : slide.script;
        
        if (!textToUse.trim()) {
            return;
        }

        setSlides(prev => prev.map((s, i) => i === idx ? { ...s, isGenerating: true } : s));
        try {
            const wavUrl = await GeminiService.generateAudio(textToUse, settings.voiceProfile);
            setSlides(prev => prev.map((s, i) => i === idx ? { ...s, audio: wavUrl, isGenerating: false } : s));
        } catch (e: any) {
            console.error(e);
            if (!isGenerating && slides.length === 1)
                alert(`音声生成に失敗しました: ${e.message}`);
            setSlides(prev => prev.map((s, i) => i === idx ? { ...s, isGenerating: false } : s));
            throw e;
        }
    };

    // Reusable batch processing queue
    const processGenerationQueue = async (targetIndices) => {
        if (targetIndices.length === 0) return;
        setIsGenerating(true);
        stopFlag.current = false;
        const BATCH_SIZE = 1;
        for (let i = 0; i < targetIndices.length; i += BATCH_SIZE) {
            if (stopFlag.current) {
                alert("生成を停止しました。");
                break;
            }
            try {
                await Promise.all(targetIndices.slice(i, i + BATCH_SIZE).map(idx => generateAudio(idx)));
            } catch (e: any) {
                if (e.status === 429 || e.code === 429 || (e.message && e.message.includes('429'))) {
                    alert(`クォータ制限に達しました。スライド ${targetIndices[i] + 1} で停止します。`);
                    break;
                }
            }
            if (i + BATCH_SIZE < targetIndices.length)
                await sleep(1500); // 1.5s delay between requests
        }
        setIsGenerating(false);
    };

    const generateAll = async () => {
        const targets = [];
        // Only target slides without audio or where users might want to regenerate missing parts
        slides.forEach((slide, i) => {
            if (((slide.useTtsScript && slide.ttsScript.trim()) || slide.script.trim()) && !slide.audio) {
                targets.push(i);
            }
        });
        await processGenerationQueue(targets);
    };

    const generateBatch = async (count) => {
        const targets = [];
        for (let i = 0; i < count; i++) {
            const idx = activeSlideIndex + i;
            if (idx < slides.length) {
                const slide = slides[idx];
                if ((slide.useTtsScript && slide.ttsScript.trim()) || slide.script.trim()) {
                    targets.push(idx);
                }
            }
        }
        await processGenerationQueue(targets);
    };

    const handleDownloadAllAudio = async () => {
        if (slides.every(s => !s.audio)) return;
        const prevExporting = isExporting;
        setIsExporting(true);
        try {
            const zip = new JSZip();
            let addedCount = 0;
            for (let i = 0; i < slides.length; i++) {
                const slide = slides[i];
                if (slide.audio) {
                    try {
                        const res = await fetch(slide.audio);
                        let blob = await res.blob();
                        let ext = 'wav';
                        if (settings.audioDownloadFormat === 'mp3') {
                            try {
                                blob = await convertToMp3(blob);
                                ext = 'mp3';
                            } catch (e) {
                                console.warn(`Failed to convert slide ${i + 1} to MP3, falling back to WAV`, e);
                            }
                        }
                        const filename = `slide_${(i + 1).toString().padStart(2, '0')}_narration.${ext}`;
                        zip.file(filename, blob);
                        addedCount++;
                    } catch (e) {
                        console.error(`Failed to add audio for slide ${i + 1}`, e);
                    }
                }
            }
            if (addedCount > 0) {
                const content = await zip.generateAsync({ type: "blob" });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);
                a.download = `narrations_${settings.audioDownloadFormat}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                alert("ZIPに含める音声ファイルが見つかりませんでした。");
            }
        } catch (e) {
            console.error("ZIP creation failed", e);
            alert("ZIPファイルの作成に失敗しました。");
        } finally {
            setIsExporting(prevExporting);
        }
    };

    const exportVideo = async () => {
        if (isExporting || slides.length === 0) return;
        if (slides.some(s => !s.audio)) {
            alert("すべてのスライドの音声を先に生成してください。");
            return;
        }
        setIsExporting(true);
        try {
            await ExportService.exportVideo(slides, settings, canvasRef.current!, (progress) => {
                // Optional: show progress bar
            });
        } catch (e) {
            console.error("Export failed", e);
            alert("動画の出力に失敗しました。");
        } finally {
            setIsExporting(false);
        }
    };

    if (slides.length === 0) {
        return (
            <>
                <LandingPage loading={loading} onPdfUpload={handlePdfUpload} onImageAdd={handleImageAdd} />
                <ResumeModal isOpen={showResumeModal} onResume={handleResumeSession} onNew={handleNewSession} />
            </>
        );
    }

    const activeSlide = slides[activeSlideIndex];

    return (
        <div className="h-[100dvh] bg-[#050505] text-white flex flex-col overflow-hidden font-['Plus_Jakarta_Sans'] select-none">
            <canvas ref={canvasRef} className="hidden" />
            
            <StudioHeader 
                settings={settings}
                isGenerating={isGenerating}
                isExporting={isExporting}
                hasSlides={slides.length > 0}
                hasAudio={slides.every(s => !!s.audio)}
                isAnalyzing={slides.some(s => s.isAnalyzing)}
                onOpenSettings={() => setShowSettings(true)}
                onGenerateAll={generateAll}
                onGenerateBatch={generateBatch}
                onOpenScriptGen={() => setShowScriptGenModal(true)}
                onExport={exportVideo}
                onDownloadAllAudio={handleDownloadAllAudio}
                onStop={() => { stopFlag.current = true; }}
            />

            <div className="flex-1 flex overflow-hidden">
                <Sidebar 
                    slides={slides} 
                    activeSlideIndex={activeSlideIndex} 
                    onSetActive={setActiveSlideIndex}
                    onMoveSlide={moveSlide}
                    onDeleteSlide={deleteSlide}
                    onDownloadAudio={(s, i) => downloadAudioFile(s.audio, `slide_${i + 1}_narration.${settings.audioDownloadFormat}`, settings.audioDownloadFormat)}
                    onCsvImport={handleCsvImport}
                    onImageAdd={handleImageAdd}
                    onPdfUpload={handlePdfUpload}
                />

                <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-black relative">
                    <Stage 
                        activeSlide={activeSlide} 
                        activeSlideIndex={activeSlideIndex} 
                        totalSlides={slides.length}
                        bgmSrc={bgmSrc}
                        settings={settings}
                        onPrev={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                        onNext={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
                    />

                    <ScriptEditor 
                        activeSlide={activeSlide}
                        activeSlideIndex={activeSlideIndex}
                        settings={settings}
                        onScriptChange={(val) => setSlides(p => p.map((s, i) => i === activeSlideIndex ? { ...s, script: val, audio: null } : s))}
                        onTtsScriptChange={(val) => setSlides(p => p.map((s, i) => i === activeSlideIndex ? { ...s, ttsScript: val, audio: null } : s))}
                        onToggleTtsMode={() => setSlides(p => p.map((s, i) => i === activeSlideIndex ? { ...s, useTtsScript: !s.useTtsScript, audio: null } : s))}
                        onGenerateAudio={() => generateAudio(activeSlideIndex)}
                        onDownloadAudio={() => activeSlide?.audio && downloadAudioFile(activeSlide.audio, `slide_${activeSlideIndex + 1}_narration.${settings.audioDownloadFormat}`, settings.audioDownloadFormat)}
                        onGenerateSingleScript={generateSingleScript}
                    />
                </div>
            </div>

            <ScriptGenModal 
                isOpen={showScriptGenModal} 
                onClose={() => setShowScriptGenModal(false)} 
                onConfirm={(purpose) => {
                    setShowScriptGenModal(false);
                    generateScripts(purpose);
                }} 
            />

            <SettingsModal 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
                settings={settings} 
                onSave={setAppSettings} 
                onBgmUpload={(f) => { setBgmSrc(URL.createObjectURL(f)); setBgmName(f.name); }}
                bgmName={bgmName}
            />

            <ResumeModal isOpen={showResumeModal} onResume={handleResumeSession} onNew={handleNewSession} />
        </div>
    );
}
