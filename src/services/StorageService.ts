const DB_NAME = 'AI_SLIDE_STUDIO_DB_V1';
const STORE_NAME = 'sessions';
const SESSION_KEY = 'autosave_slot_1';

export const StorageService = {
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    },

    async hasSession() {
        try {
            const db: any = await this.initDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.count(SESSION_KEY);
                req.onsuccess = () => resolve(req.result > 0);
                req.onerror = () => reject(req.error);
            });
        } catch (e) {
            return false;
        }
    },

    async saveSession(slides, settings, activeSlideIndex, bgmSrc, bgmName) {
        const db: any = await this.initDB();
        
        // Transform slides: fetch audio blob if it's a URL to store persistent data
        const slidesData = await Promise.all(slides.map(async (s) => {
            let audioBlob = null;
            if (s.audio) {
                try {
                    // If it's a blob URL, we need to fetch the blob data
                    if (s.audio.startsWith('blob:')) {
                        const res = await fetch(s.audio);
                        audioBlob = await res.blob();
                    }
                } catch (e) {
                    console.warn('Failed to fetch audio blob for saving', e);
                }
            }
            return { ...s, audio: audioBlob };
        }));

        let bgmBlob = null;
        if (bgmSrc && bgmSrc.startsWith('blob:')) {
            try {
                const res = await fetch(bgmSrc);
                bgmBlob = await res.blob();
            } catch (e) {
                console.warn('Failed to fetch BGM blob', e);
            }
        }

        const session = {
            slides: slidesData,
            settings,
            activeSlideIndex,
            bgmBlob,
            bgmName,
            timestamp: Date.now()
        };

        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.put(session, SESSION_KEY);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async loadSession() {
        const db: any = await this.initDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(SESSION_KEY);
            req.onsuccess = () => {
                const result = req.result;
                if (!result) {
                    resolve(null);
                    return;
                }
                // Reconstruct Blob URLs
                const slides = result.slides.map(s => ({
                    ...s,
                    audio: s.audio instanceof Blob ? URL.createObjectURL(s.audio) : null
                }));
                const bgmSrc = result.bgmBlob instanceof Blob ? URL.createObjectURL(result.bgmBlob) : null;
                
                resolve({
                    slides,
                    settings: result.settings,
                    activeSlideIndex: result.activeSlideIndex,
                    bgmSrc,
                    bgmName: result.bgmName
                });
            };
            req.onerror = () => reject(req.error);
        });
    },

    async clearSession() {
        const db: any = await this.initDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.delete(SESSION_KEY);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
};
