export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

export function pcmToWav(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + len, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 24000, true);
    view.setUint32(28, 24000 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, len, true);

    const blob = new Blob([view, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
}

export function getSubtitleSegments(text) {
    const segments = [];
    if (!text) return segments;

    // Split by Japanese and English punctuation for better subtitle flow
    const chunks = text.split(/([、。,.] )/).reduce((acc, curr, i, arr) => {
        if (i % 2 === 0) {
            const next = arr[i + 1] || '';
            if (curr.trim()) acc.push(curr + next);
        }
        return acc;
    }, []);

    const totalChars = chunks.join('').length;
    let currentPos = 0;

    chunks.forEach(chunk => {
        const len = chunk.length;
        if (len === 0) return;
        segments.push({
            text: chunk,
            startRatio: currentPos / totalChars,
            endRatio: (currentPos + len) / totalChars
        });
        currentPos += len;
    });

    if (segments.length === 0 && text.trim()) {
        segments.push({ text: text, startRatio: 0, endRatio: 1 });
    }

    return segments;
}

export async function convertToMp3(wavBlob) {
    const buffer = await wavBlob.arrayBuffer();
    // WAV header is 44 bytes.
    if (buffer.byteLength <= 44) throw new Error("Invalid WAV data");
    const pcmData = new Int16Array(buffer.slice(44));
    
    const lamejs = (window as any).lamejs;
    if (!lamejs) {
        throw new Error("MP3 encoder library (lamejs) not found");
    }

    // Sample rate and channels should match the WAV generation (24kHz, Mono)
    const mp3encoder = new lamejs.Mp3Encoder(1, 24000, 128);
    const mp3Data = [];

    const mp3buf = mp3encoder.encodeBuffer(pcmData);
    if (mp3buf.length > 0) mp3Data.push(mp3buf);

    const mp3bufflush = mp3encoder.flush();
    if (mp3bufflush.length > 0) mp3Data.push(mp3bufflush);

    return new Blob(mp3Data, { type: 'audio/mp3' });
}

export function downloadAudioFile(url, filename, format) {
    if (format === 'mp3') {
        fetch(url)
            .then(r => r.blob())
            .then(async (blob) => {
                try {
                    const mp3Blob = await convertToMp3(blob);
                    const blobUrl = URL.createObjectURL(mp3Blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = filename.replace('.wav', '.mp3');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } catch (e) {
                    console.error(e);
                    alert("Failed to convert to MP3.");
                }
            })
            .catch((e) => {
                console.error(e);
                alert("Failed to download audio.");
            });
    } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
