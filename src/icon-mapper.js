/**
 * Icon Mapper - Maps concepts to Material Icons
 */

export class IconMapper {
    constructor() {
        // Simplified mapping: concept -> icon name
        this.map = {
            // Finance/Business
            money: 'attach_money', finance: 'trending_up', market: 'show_chart',
            stock: 'candlestick_chart', bank: 'account_balance', wealth: 'diamond',

            // Creative/Art
            art: 'palette', design: 'brush', creative: 'color_lens',
            image: 'image', photo: 'photo_camera', draw: 'edit',

            // Tech/Code
            tech: 'computer', code: 'code', software: 'integration_instructions',
            data: 'storage', cloud: 'cloud', ai: 'psychology', bot: 'smart_toy',

            // Nature
            nature: 'nature', tree: 'park', water: 'water_drop',
            sun: 'sunny', earth: 'public', leaf: 'eco',

            // Social
            people: 'people', friend: 'person_add', community: 'groups',
            connect: 'share', message: 'chat', love: 'favorite',

            // Time/Motion
            time: 'schedule', speed: 'speed', fast: 'fast_forward',
            slow: 'slow_motion_video', wait: 'hourglass_empty',

            // Abstract
            idea: 'lightbulb', thought: 'psychology', concept: 'extension',
            energy: 'bolt', power: 'flash_on', spirit: 'auto_awesome',

            // Emotions
            happy: 'sentiment_satisfied', sad: 'sentiment_dissatisfied',
            hope: 'wb_sunny', fear: 'warning', peace: 'self_improvement',

            // Knowledge
            learn: 'school', book: 'menu_book', knowledge: 'local_library',
            wisdom: 'history_edu', question: 'help', answer: 'check_circle'
        };

        // Fallback by semantic groups
        this.semanticMap = {
            // Contains these words -> map to
            'fin|mon|cash|dol|invest': 'trending_up',
            'cre|art|des|col|sty': 'palette',
            'tech|cod|soft|dat|app': 'code',
            'nat|tre|wat|lea|gra': 'nature',
            'soc|peo|fri|com|cha': 'people',
            'tim|fas|slo|wa|du': 'schedule',
            'lea|boo|kno|wis|edu': 'school',
            'fee|emo|mo|hap|sa': 'favorite',
            'ene|pow|lig|fir|sp': 'bolt'
        };
    }

    mapToIcon(concept) {
        if (!concept) return null;

        // Direct match
        if (this.map[concept]) {
            return { name: this.map[concept], category: 'direct' };
        }

        // Semantic match
        for (const [pattern, icon] of Object.entries(this.semanticMap)) {
            if (new RegExp(pattern, 'i').test(concept)) {
                return { name: icon, category: 'semantic' };
            }
        }

        // First letter fallback for consistency
        const letterIcons = {
            a: 'abc', b: 'bookmark', c: 'circle', d: 'diamond',
            e: 'email', f: 'favorite', g: 'grade', h: 'help',
            i: 'info', j: 'join_inner', k: 'key', l: 'label',
            m: 'maps_ugc', n: 'navigation', o: 'opacity', p: 'play_arrow',
            q: 'qr_code', r: 'refresh', s: 'star', t: 'tag',
            u: 'upload', v: 'verified', w: 'work', x: 'close',
            y: 'y', z: 'zoom_in'
        };

        const firstChar = concept.charAt(0).toLowerCase();
        if (letterIcons[firstChar]) {
            return { name: letterIcons[firstChar], category: 'letter' };
        }

        return { name: 'auto_awesome', category: 'default' };
    }
}
