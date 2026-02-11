/**
 * LLM Analyzer using Transformers.js
 * Extracts contextual abstract nouns from text
 *
 * Note: The LLM feature is optional. If it fails to load,
 * the system automatically falls back to keyword-based analysis.
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Configure for browser-only
env.allowLocalModels = false;
env.useBrowserCache = true;

export class LLMAnalyzer {
    constructor(progressCallback = null) {
        this.generator = null;
        this.ready = false;
        this.modelName = 'Xenova/gpt2';
        this.progressCallback = progressCallback;
    }

    async init(onProgress = null) {
        const callback = onProgress || this.progressCallback;
        try {
            console.time('[LLM] Model load time');
            console.log('[LLM] Attempting to load model:', this.modelName);

            // Add timeout - GPT-2 model is large (~234MB) so give it 90 seconds
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Model load timeout after 90 seconds')), 90000)
            );

            const loadPromise = pipeline('text-generation', this.modelName, {
                progress_callback: (progress) => {
                    if (progress.status === 'downloading') {
                        const pct = progress.progress ? Math.round(progress.progress) : 0;
                        console.log(`[LLM] Downloading model: ${pct}%`);
                        if (callback) callback('downloading', pct);
                    } else if (progress.status === 'progress') {
                        const pct = progress.progress ? Math.round(progress.progress) : 0;
                        if (pct % 20 === 0) {
                            console.log(`[LLM] Loading: ${pct}%`);
                        }
                        if (callback && pct > 0) callback('loading', pct);
                    }
                }
            });

            this.generator = await Promise.race([loadPromise, timeoutPromise]);

            console.timeEnd('[LLM] Model load time');
            this.ready = true;
            console.log('[LLM] Model loaded successfully');
            return true;
        } catch (e) {
            console.error('[LLM] Init failed:', e.message);
            // This is expected - the system will use fallback mode
            return false;
        }
    }

    isReady() {
        return this.ready && this.generator !== null;
    }

    async extractContextualNouns(text, maxNouns = 5) {
        if (!this.isReady()) return null;

        try {
            // Simpler prompt for GPT-2
            const prompt = `Keywords: ${text.substring(0, 300)}\n\nKey concepts:`;

            const output = await this.generator(prompt, {
                max_new_tokens: 25,
                temperature: 0.8,
                do_sample: true,
                top_k: 30,
                return_full_text: false
            });

            const result = output[0]?.generated_text || '';
            console.log('[LLM] Raw output:', result);

            // Extract potential nouns/keywords from output
            const nouns = result
                .split(/[,\\n\\-\\s]+/)
                .map(w => w.trim().toLowerCase().replace(/[^a-z]/g, ''))
                .filter(w => w.length > 3 && w.length < 20)
                .slice(0, maxNouns);

            console.log('[LLM] Extracted:', nouns);
            return nouns.length > 0 ? nouns : null;
        } catch (e) {
            console.error('[LLM] Extract failed:', e.message);
            return null;
        }
    }
}
