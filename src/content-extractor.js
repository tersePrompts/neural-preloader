/**
 * Content Extractor - Extracts visible text from page
 */

export class ContentExtractor {
    constructor() {
        this.ignoreTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG']);

        // Enhanced keyword-to-icon mapping for the demo
        this.keywordIconMap = {
            // Finance
            'finance': 'account_balance', 'financial': 'account_balance', 'money': 'payments',
            'stock': 'trending_up', 'portfolio': 'show_chart', 'market': 'candlestick_chart',
            'investment': 'savings', 'wealth': 'account_balance_wallet', 'crypto': 'currency_bitcoin',
            'bank': 'account_balance', 'trading': 'sync_alt',

            // Creative/Art
            'creative': 'palette', 'art': 'brush', 'design': 'color_lens',
            'illustration': 'draw', 'photo': 'photo_camera', 'visual': 'visibility',
            'studio': 'brush', 'artistic': 'auto_awesome',

            // Technology
            'technology': 'memory', 'tech': 'developer_mode', 'software': 'code',
            'development': 'terminal', 'cloud': 'cloud', 'computing': 'computer',
            'ai': 'psychology', 'intelligence': 'smart_toy', 'digital': 'devices',
            'infrastructure': 'settings_ethernet', 'innovations': 'lightbulb',

            // Nature
            'nature': 'park', 'environment': 'eco', 'ecosystem': 'forest',
            'conservation': 'recycling', 'sustainable': 'energy_savings_leaf',
            'outdoor': 'landscape', 'planet': 'public', 'earth': 'language',
            'green': 'grass', 'wildlife': 'pets',

            // Social
            'social': 'groups', 'connection': 'connect_without_contact',
            'relationship': 'diversity_3', 'community': 'people',
            'collaboration': 'handshake', 'communication': 'forum',
            'together': 'diversity_1', 'share': 'share',

            // General concepts
            'data': 'storage', 'information': 'info', 'analysis': 'analytics',
            'dashboard': 'dashboard', 'tools': 'build', 'power': 'bolt',
            'explore': 'explore', 'discover': 'search', 'learn': 'school',
            'create': 'add_circle', 'build': 'construction', 'make': ' handyman'
        };
    }

    getVisibleContent() {
        // Get viewport content only
        const viewportHeight = window.innerHeight;
        const elements = document.querySelectorAll('body *');

        let content = '';
        let lastY = -1;

        for (const el of elements) {
            if (this.ignoreTags.has(el.tagName)) continue;

            const rect = el.getBoundingClientRect();

            // Check if in viewport
            if (rect.top < viewportHeight && rect.bottom > 0 &&
                rect.width > 0 && rect.height > 0) {

                // Avoid duplicate content from nested elements
                if (Math.abs(rect.top - lastY) < 5) continue;
                lastY = rect.top;

                const text = el.textContent?.trim();
                if (text && text.length > 20) {
                    content += text + ' ';
                    if (content.length > 2000) break; // Limit
                }
            }
        }

        return content.trim();
    }

    extractKeywords(text) {
        // Enhanced keyword extraction with icon mapping
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3);

        // Common words to filter
        const stopWords = new Set([
            'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you',
            'this', 'but', 'his', 'from', 'they', 'she', 'her', 'been',
            'than', 'its', 'were', 'said', 'each', 'does', 'their', 'about',
            'your', 'will', 'just', 'more', 'when', 'what', 'which', 'their'
        ]);

        const filtered = words.filter(w => !stopWords.has(w));

        // Find mapped icons first, then fall back to frequency
        const foundIcons = [];
        for (const word of filtered) {
            if (this.keywordIconMap[word] && !foundIcons.includes(this.keywordIconMap[word])) {
                foundIcons.push(this.keywordIconMap[word]);
            }
        }

        // If we found icon mappings, return the icon names
        if (foundIcons.length > 0) {
            return foundIcons;
        }

        // Otherwise return top keywords by frequency
        const freq = {};
        for (const w of filtered) freq[w] = (freq[w] || 0) + 1;

        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(e => e[0]);
    }

    /**
     * Get a contextual icon based on data-section attribute
     */
    getSectionIcon(section) {
        const sectionMap = {
            'finance': 'account_balance',
            'creative': 'palette',
            'tech': 'code',
            'nature': 'nature',
            'social': 'groups'
        };
        return sectionMap[section] || 'auto_awesome';
    }
}
