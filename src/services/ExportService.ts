import { getSubtitleSegments, sleep } from '@/utils';

export class ExportService {
    static async exportVideo(slides, settings, canvas, onProgress) {
        // Basic setup
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        const audioCtx = new AudioContext();
        const dest = audioCtx.createMediaStreamDestination();

        // Determine MIME type
        let actualMime = 'video/webm';
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
            actualMime = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            actualMime = 'video/mp4';
        }

        const stream = canvas.captureStream(30);
        // Merge audio tracks
        dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));

        const mediaRecorder = new MediaRecorder(stream, { mimeType: actualMime });
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        const finishedPromise = new Promise<void>((resolve) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: actualMime });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `slide_studio_export.${actualMime.includes('mp4') ? 'mp4' : 'webm'}`;
                a.click();
                audioCtx.close();
                resolve();
            };
        });

        mediaRecorder.start();

        const startTime = audioCtx.currentTime;
        let currentOffset = 0;

        // Rendering Loop
        for (let i = 0; i < slides.length; i++) {
            const s = slides[i];
            let audioDuration = 3.0; // Default fallback duration

            if (s.audio) {
                try {
                    const res = await fetch(s.audio);
                    const ab = await res.arrayBuffer();
                    const buf = await audioCtx.decodeAudioData(ab);
                    const node = audioCtx.createBufferSource();
                    node.buffer = buf;
                    node.playbackRate.value = settings.voiceSpeed;
                    node.connect(dest);
                    node.start(startTime + currentOffset);
                    audioDuration = buf.duration / settings.voiceSpeed;
                } catch (e) {
                    console.error("Failed to decode audio for export", e);
                }
            }

            const slideTotalDuration = audioDuration + settings.slideGap;
            const subtitleText = s.script.trim() ? s.script : s.ttsScript;
            const segs = getSubtitleSegments(subtitleText);

            const img = new Image();
            img.src = s.image;
            await new Promise((r) => {
                if (img.complete) r(true);
                else img.onload = () => r(true);
            });

            // Frame Loop
            const startRenderTime = audioCtx.currentTime;
            while (audioCtx.currentTime - startTime < currentOffset + slideTotalDuration) {
                const elapsed = audioCtx.currentTime - startTime - currentOffset;

                // Render Image (Contain)
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 1920, 1080);
                const scale = Math.min(1920 / img.width, 1080 / img.height);
                const x = (1920 - img.width * scale) / 2;
                const y = (1080 - img.height * scale) / 2;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Render Subtitle
                const sub = (elapsed < audioDuration) 
                    ? segs.find(seg => (elapsed / audioDuration) >= seg.startRatio && (elapsed / audioDuration) < seg.endRatio)
                    : null;

                if (sub) {
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.fillRect(100, 950, 1720, 100);
                    ctx.fillStyle = settings.subtitleColor;
                    ctx.font = `bold 42px "${settings.fontFamily === 'serif' ? 'Noto Serif JP' : 'Noto Sans JP'}"`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = "rgba(0,0,0,0.8)";
                    ctx.shadowBlur = 4;
                    ctx.fillText(sub.text, 960, 1000);
                }

                // Calculate progress
                const totalDurationEstimate = slides.length * 10; // Rough estimate
                const globalElapsed = currentOffset + elapsed;
                onProgress(Math.round(((i / slides.length) + (elapsed / slideTotalDuration / slides.length)) * 100));

                await sleep(33); // ~30fps
            }

            currentOffset += slideTotalDuration;
        }

        mediaRecorder.stop();
        await finishedPromise;
    }
}
