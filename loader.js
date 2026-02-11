/**
 * Contextual Icon Loader
 * A lightweight, client-side icon visualizer that uses LLM to generate
 * contextual abstract icons based on page content.
 *
 * Author: AI Preloaders
 * License: MIT
 */

import { LLMAnalyzer } from './src/llm-analyzer.js';
import { IconMapper } from './src/icon-mapper.js';
import { IconAnimator } from './src/icon-animator.js';
import { ContentExtractor } from './src/content-extractor.js';

class ContextualIconLoader {
    constructor(options = {}) {
        // Configuration
        this.config = {
            container: options.container || document.body,
            canvasId: options.canvasId || 'iconCanvas',
            position: options.position || 'bottom-right',
            animationMode: options.animationMode || 'loop',
            updateInterval: options.updateInterval || 5000,
            useFallback: options.useFallback !== false,
            fallbackIcons: options.fallbackIcons || ['stars', 'circle', 'auto_awesome'],
            ...options
        };

        // State
        this.isInitialized = false;
        this.currentIcons = [];
        this.animationId = null;
        this.positionIndex = 0;
        this.isPaused = false;

        // Components
        this.llmAnalyzer = new LLMAnalyzer((status, progress) => this.onLLMProgress(status, progress));
        this.iconMapper = new IconMapper();
        this.animator = null;
        this.contentExtractor = new ContentExtractor();

        // Bind methods
        this.init = this.init.bind(this);
        this.updateIcons = this.updateIcons.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    async init() {
        try {
            console.log('[IconLoader] Initializing...');

            // Initialize canvas and animator
            const canvas = document.getElementById(this.config.canvasId);
            if (!canvas) {
                throw new Error(`Canvas with id "${this.config.canvasId}" not found`);
            }

            this.animator = new IconAnimator(canvas);
            this.animator.start();

            // Try to initialize LLM
            const llmReady = await this.llmAnalyzer.init();

            if (llmReady) {
                this.updateStatus('ready', 'LLM Ready - Analyzing content...');
                console.log('[IconLoader] LLM initialized successfully');

                // Initial content analysis
                await this.updateIcons();

                // Set up periodic updates
                this.setupAutoUpdate();

                // Set up content observer for dynamic changes
                this.setupContentObserver();
            } else {
                // Use fallback mode
                this.updateStatus('fallback', 'Using fallback mode');
                console.log('[IconLoader] Using fallback mode');
                this.startFallbackMode();
            }

            // Handle visibility changes
            document.addEventListener('visibilitychange', this.handleVisibilityChange);

            this.isInitialized = true;
            console.log('[IconLoader] Initialization complete');

            return true;
        } catch (error) {
            console.error('[IconLoader] Initialization failed:', error);
            this.updateStatus('fallback', 'Error - Using fallback');
            this.startFallbackMode();
            return false;
        }
    }

    /**
     * Extract visible content and update icons
     */
    async updateIcons() {
        if (!this.isInitialized || this.isPaused) return;

        try {
            // Extract visible text content
            const content = this.contentExtractor.getVisibleContent();

            if (!content || content.trim().length < 50) {
                console.log('[IconLoader] Not enough content to analyze');
                return;
            }

            console.log('[IconLoader] Analyzing content:', content.substring(0, 100) + '...');

            // Get contextual nouns from LLM
            let nouns = [];
            if (this.llmAnalyzer.isReady()) {
                nouns = await this.llmAnalyzer.extractContextualNouns(content);
            }

            // If LLM fails or returns empty, use keyword extraction
            if (!nouns || nouns.length === 0) {
                nouns = this.contentExtractor.extractKeywords(content);
            }

            console.log('[IconLoader] Extracted concepts:', nouns);

            // Convert nouns to icon format (if they're already icon names, use them directly)
            this.currentIcons = nouns.map(noun => {
                // Check if it's already an icon name from our enhanced extractor
                if (this.contentExtractor.keywordIconMap?.[noun]) {
                    return { name: this.contentExtractor.keywordIconMap[noun], category: 'keyword' };
                }
                // Otherwise use the icon mapper
                const mapped = this.iconMapper.mapToIcon(noun);
                return mapped || { name: 'auto_awesome', category: 'fallback' };
            }).filter(icon => icon !== null);

            // Ensure we have at least some icons
            if (this.currentIcons.length === 0) {
                this.currentIcons = this.config.fallbackIcons.map(name => ({ name, category: 'fallback' }));
            }

            // Update animator with new icons
            this.animator.updateIcons(this.currentIcons);

            // Update icon label
            this.updateIconLabel(this.currentIcons);

        } catch (error) {
            console.error('[IconLoader] Error updating icons:', error);
        }
    }

    /**
     * Update the icon label to show current icon name
     */
    updateIconLabel(icons) {
        const label = document.getElementById('iconLabel');
        if (label && icons.length > 0) {
            const mainIcon = icons[0].name.replace(/_/g, ' ');
            label.textContent = mainIcon.charAt(0).toUpperCase() + mainIcon.slice(1);
        }
    }

    /**
     * Set up automatic content updates
     */
    setupAutoUpdate() {
        // Update periodically
        setInterval(() => {
            if (!document.hidden) {
                this.updateIcons();
            }
        }, this.config.updateInterval);

        // Update on scroll (debounced)
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (!document.hidden) {
                    this.updateIcons();
                }
            }, 500);
        });
    }

    /**
     * Set up MutationObserver for dynamic content changes
     */
    setupContentObserver() {
        const observer = new MutationObserver((mutations) => {
            // Only react to significant content changes
            const hasContentChange = mutations.some(mutation =>
                mutation.type === 'childList' &&
                mutation.addedNodes.length > 0
            );

            if (hasContentChange && !document.hidden) {
                // Debounce the update
                clearTimeout(this._observerTimeout);
                this._observerTimeout = setTimeout(() => this.updateIcons(), 1000);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Start fallback mode with random icons
     */
    startFallbackMode() {
        this.currentIcons = this.config.fallbackIcons.map(name => ({ name, category: 'fallback' }));
        if (this.animator) {
            this.animator.updateIcons(this.currentIcons);
        }
        this.updateIconLabel(this.currentIcons);

        // Cycle through fallback icons
        setInterval(() => {
            if (!this.isPaused && !document.hidden) {
                const randomIcon = this.config.fallbackIcons[
                    Math.floor(Math.random() * this.config.fallbackIcons.length)
                ];
                this.currentIcons = [{ name: randomIcon, category: 'fallback' }];
                if (this.animator) {
                    this.animator.updateIcons(this.currentIcons);
                }
                this.updateIconLabel(this.currentIcons);
            }
        }, 3000);
    }

    /**
     * Update status badge
     */
    updateStatus(state, text) {
        const badge = document.getElementById('statusBadge');
        const statusText = document.getElementById('statusText');

        if (badge && statusText) {
            badge.className = `status-badge ${state}`;
            statusText.textContent = text;
        }
    }

    /**
     * Handle LLM loading progress
     */
    onLLMProgress(status, progress) {
        if (status === 'downloading') {
            this.updateStatus('loading', `Downloading AI model: ${progress}%`);
        } else if (status === 'loading') {
            this.updateStatus('loading', `Loading AI model: ${progress}%`);
        }
    }

    /**
     * Handle visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.isPaused = true;
            if (this.animator) this.animator.pause();
        } else {
            this.isPaused = false;
            if (this.animator) this.animator.resume();
            this.updateIcons();
        }
    }

    /**
     * Public: Trigger manual analysis
     */
    async triggerAnalysis() {
        console.log('[IconLoader] Manual analysis triggered');
        await this.updateIcons();
    }

    /**
     * Public: Toggle container position
     */
    togglePosition() {
        const positions = ['right', 'left', 'center'];
        this.positionIndex = (this.positionIndex + 1) % positions.length;
        const position = positions[this.positionIndex];

        const container = document.getElementById('loaderContainer');
        if (container) {
            container.className = 'icon-loader-container';
            if (position === 'left') {
                container.classList.add('position-left');
            } else if (position === 'center') {
                container.classList.add('position-center');
            }
        }
    }

    /**
     * Public: Toggle animation mode
     */
    toggleMode() {
        if (this.animator) {
            this.animator.toggleMode();
        }
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        if (this.animator) {
            this.animator.destroy();
        }
    }
}

// Export for global access
window.ContextualIconLoader = ContextualIconLoader;

// Auto-initialize with default settings
const loaders = new ContextualIconLoader();

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loaders.init());
} else {
    loaders.init();
}

// Export for demo controls
window.loaders = loaders;

export default ContextualIconLoader;
