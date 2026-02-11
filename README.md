# AI Preloaders - Scene Generator

A hobby project exploring client-side AI for generating contextual loading scenes using LLM.

![Demo](demo.gif)

> **Live Demo:** Open `ai-generator.html` in your browser

## The Idea

Instead of boring spinners, loading screens that:
- Use AI to generate contextual multi-icon scenes
- Display quirky AI-generated text messages
- Support 7 moods (Funny, Techie, Clumsy, Dramatic, Minimal, Cryptic, Enthusiastic)
- 5 scene layouts (single, orbit, flow, stack, scatter)

## Quick Start

```bash
# Clone and run
git clone <repo>
cd ai-preloaders
python -m http.server 8080

# Open http://localhost:8080/ai-generator.html
```

## Use as a Preloader in Your Project

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<script type="module">
  import { init, show, hide } from './dist/index.js';

  // Initialize
  const preloader = await init({
    status: 'Loading...',
    mood: 'techie'
  });

  // Show during loading
  preloader.show('Verifying credentials...', 'techie');

  // Hide when done
  preloader.hide();
</script>
```

## API

```javascript
// Initialize with options
await init({
  container: document.getElementById('preloader'), // optional, auto-creates overlay
  status: 'Loading...',
  mood: 'techie',           // funny, techie, clumsy, dramatic, minimal, cryptic, enthusiastic
  autoGenerate: true
});

// Show scene
show('Processing payment...', 'dramatic');

// Hide scene
hide();

// Change mood
setMood('enthusiastic');
```

## How It Works

1. **Transformers.js** runs GPT-2 entirely in the browser
2. **MAX temperature** (1.5-2.5) for experimental output
3. **Mood-based prompts** for text generation
4. Fallback to keyword matching if LLM unavailable

## Tech Stack

- Vanilla JS (ES6 modules)
- Transformers.js (Xenova/gpt2)
- Material Icons

## Notes

- First load downloads LLM model (~234MB) - cached after
- Falls back gracefully if LLM fails
- This is a fun experiment, not production code

## License

MIT
