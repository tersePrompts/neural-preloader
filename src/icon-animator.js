/**
 * Icon Animator - Canvas-based icon animation
 */

export class IconAnimator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.icons = [];
        this.running = false;
        this.paused = false;
        this.mode = 'float'; // float, pulse, rotate
        this.time = 0;

        // Preload Material Icons font
        if (document.fonts) {
            document.fonts.load('10px "Material Icons"').catch(() => {});
        }
    }

    updateIcons(icons) {
        this.icons = icons.map(icon => ({
            name: icon.name,
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 20 + Math.random() * 30,
            speed: 0.5 + Math.random() * 1,
            opacity: 0.3 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2
        }));
    }

    start() {
        this.running = true;
        this.animate();
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    toggleMode() {
        const modes = ['float', 'pulse', 'rotate'];
        const idx = modes.indexOf(this.mode);
        this.mode = modes[(idx + 1) % modes.length];
    }

    animate() {
        if (!this.running) return;

        if (!this.paused) {
            this.render();
            this.time += 0.016;
        }

        requestAnimationFrame(() => this.animate());
    }

    render() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);

        // Background gradient
        const gradient = this.ctx.createRadialGradient(
            width/2, height/2, 0,
            width/2, height/2, width/2
        );
        gradient.addColorStop(0, 'rgba(100, 181, 246, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        // Draw icons
        this.ctx.font = '24px Material Icons';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (const icon of this.icons) {
            this.ctx.save();

            let x = icon.x;
            let y = icon.y;
            let alpha = icon.opacity;

            switch (this.mode) {
                case 'float':
                    y += Math.sin(this.time + icon.phase) * 10;
                    alpha = icon.opacity * (0.5 + 0.5 * Math.sin(this.time * 2 + icon.phase));
                    break;
                case 'pulse':
                    alpha = icon.opacity * (0.3 + 0.7 * Math.abs(Math.sin(this.time * 3 + icon.phase)));
                    break;
                case 'rotate':
                    x = width/2 + Math.cos(this.time + icon.phase) * 30;
                    y = height/2 + Math.sin(this.time + icon.phase) * 30;
                    break;
            }

            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#64b5f6';
            this.ctx.fillText(icon.name, x, y);
            this.ctx.restore();
        }
    }

    destroy() {
        this.running = false;
    }
}
