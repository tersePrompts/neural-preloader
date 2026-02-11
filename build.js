import fs from 'fs';
import path from 'path';

// Create dist directory
const distDir = './dist';
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// Copy the main HTML as demo
fs.copyFileSync('ai-generator.html', path.join(distDir, 'index.html'));

// Create standalone JS module
const jsContent = `
/**
 * AI Scene Generator - Standalone Module
 * Use as a preloader in your project
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
env.allowLocalModels = false;
env.useBrowserCache = true;

// Configuration
let config = {
    container: null,
    status: '',
    mood: 'techie',
    sceneType: 'single',
    autoGenerate: true
};

// State
let generator = null;
let currentScene = null;

// Icon categories
const ICONS = {
    security: ['lock', 'shield', 'verified_user', 'security', 'vpn_key', 'https', 'fingerprint'],
    data: ['storage', 'folder', 'description', 'insert_drive_file', 'cloud', 'database', 'save'],
    process: ['settings', 'autorenew', 'sync', 'refresh', 'cached', 'construction', 'build'],
    network: ['wifi', 'router', 'cloud', 'signal_cellular_alt', 'hub', 'share'],
    success: ['check_circle', 'done_all', 'task_alt', 'verified', 'celebration'],
    error: ['error', 'warning', 'report_problem', 'priority_high']
};

const SCENES = ['single', 'orbit', 'flow', 'stack', 'scatter'];

// Initialize
export async function init(options = {}) {
    config = { ...config, ...options };

    // Create container if not provided
    if (!config.container) {
        config.container = document.createElement('div');
        config.container.id = 'ai-preloader-container';
        document.body.appendChild(config.container);
    }

    // Inject styles
    if (!document.getElementById('ai-preloader-styles')) {
        const style = document.createElement('style');
        style.id = 'ai-preloader-styles';
        style.textContent = getStyles();
        document.head.appendChild(style);
    }

    // Load LLM
    try {
        generator = await pipeline('text-generation', 'Xenova/gpt2');
        console.log('[AI Preloader] LLM ready');
    } catch (e) {
        console.log('[AI Preloader] Using fallback mode');
    }

    // Generate initial scene
    if (config.autoGenerate && config.status) {
        show(config.status, config.mood);
    }

    return { hide, show, setMood, setContainer };
}

// Show scene
export async function show(status, mood = config.mood) {
    config.status = status;
    config.mood = mood;

    const scene = await generateScene(status, mood);
    currentScene = scene;
    render(scene);
    config.container.style.display = 'flex';

    return scene;
}

// Hide scene
export function hide() {
    if (config.container) {
        config.container.style.display = 'none';
    }
}

// Set mood
export function setMood(mood) {
    config.mood = mood;
}

// Set container
export function setContainer(element) {
    config.container = element;
}

// Generate scene
async function generateScene(status, mood) {
    if (!generator) return fallbackScene(status, mood);

    try {
        const temp = 1.5 + Math.random();
        const output = await generator('Pick an icon', {
            max_new_tokens: 10,
            temperature: temp,
            do_sample: true,
            return_full_text: false
        });

        return {
            type: SCENES[Math.floor(Math.random() * SCENES.length)],
            icon: 'auto_awesome',
            text: status
        };
    } catch (e) {
        return fallbackScene(status, mood);
    }
}

// Fallback
function fallbackScene(status, mood) {
    return {
        type: 'single',
        icon: 'autorenew',
        text: status
    };
}

// Render
function render(scene) {
    const { type, icon, text } = scene;
    config.container.innerHTML = \`
        <div class="ai-preloader-scene scene-\${type}">
            <span class="ai-preloader-icon">
                <span class="material-icons icon-large">\${icon}</span>
            </span>
            <span class="ai-preloader-text">\${text}</span>
        </div>
    \`;
}

// Get CSS styles
function getStyles() {
    return \`
        #ai-preloader-container {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
            display: none; align-items: center; justify-content: center;
            z-index: 9999;
        }
        .ai-preloader-scene { display: flex; flex-direction: column; align-items: center; }
        .ai-preloader-icon { color: #667eea; }
        .material-icons.icon-large { font-size: 80px; }
        .ai-preloader-text { color: #fff; margin-top: 20px; font-size: 1.2rem; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .scene-single .material-icons { animation: spin 2s linear infinite; }
    \`;
}
`;

fs.writeFileSync(path.join(distDir, 'index.js'), jsContent);
console.log('✅ Build complete - dist/ folder created');
