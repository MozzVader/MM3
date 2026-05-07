/**
 * share.js — Modulo compartido de compartir resultados
 * Genera imagen Canvas del resultado y abre share dialog.
 */
const MiniShare = (() => {

    const SITE_URL = 'https://mozzvader.github.io/MM3';

    // ── Colores por juego ──
    const THEMES = {
        match3:  { bg1: '#0a0a2e', bg2: '#1a0a3e', accent: '#ff6b35', icon: '\u{1F48E}' },
        memotest:{ bg1: '#0a1a2e', bg2: '#1a0a3e', accent: '#00d2ff', icon: '\u{1F0CF}' },
        sudoku:  { bg1: '#0a1a0a', bg2: '#1a0a3e', accent: '#00c853', icon: '\u{1F9E9}' }
    };

    const DIFF_LABELS = {
        easy: 'Facil', normal: 'Normal', medium: 'Medio', hard: 'Dificil', expert: 'Experto'
    };

    // ── Genera imagen Canvas ──
    function generateImage(game, data) {
        const W = 600, H = 340;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        const t = THEMES[game] || THEMES.match3;

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, t.bg1);
        grad.addColorStop(1, t.bg2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Subtle grid pattern
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 30) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 30) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // Top accent line
        const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
        lineGrad.addColorStop(0, 'transparent');
        lineGrad.addColorStop(0.3, t.accent);
        lineGrad.addColorStop(0.7, t.accent);
        lineGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = lineGrad;
        ctx.fillRect(0, 0, W, 3);

        // Game icon + title
        ctx.font = '700 28px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${t.icon} ${data.title}`, W / 2, 60);

        // Subtitle
        ctx.font = '400 14px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Mini Arcade', W / 2, 82);

        // Separator
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(W * 0.2, 98); ctx.lineTo(W * 0.8, 98); ctx.stroke();

        // Stats rows
        const stats = data.stats || [];
        const startY = 130;
        const rowH = 38;

        stats.forEach((s, i) => {
            const y = startY + i * rowH;

            // Label
            ctx.font = '400 15px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.textAlign = 'left';
            ctx.fillText(s.label, 60, y);

            // Value
            ctx.font = '700 17px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(s.value, W - 60, y);
        });

        // Big score at bottom
        if (data.score !== undefined && data.score !== null) {
            const scoreY = startY + stats.length * rowH + 30;

            // Score label
            ctx.font = '400 12px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.textAlign = 'center';
            ctx.fillText('PUNTUACION', W / 2, scoreY);

            // Score value
            ctx.font = '900 42px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = t.accent;
            ctx.textAlign = 'center';
            ctx.fillText(data.score.toLocaleString('es-AR'), W / 2, scoreY + 42);
        }

        // Bottom line
        ctx.fillStyle = lineGrad;
        ctx.fillRect(0, H - 3, W, 3);

        // URL
        ctx.font = '400 11px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'center';
        ctx.fillText(SITE_URL, W / 2, H - 14);

        return canvas;
    }

    // ── Genera texto para compartir ──
    function buildText(game, data) {
        const lines = [`${data.title} - Mini Arcade`];
        (data.stats || []).forEach(s => lines.push(`${s.label}: ${s.value}`));
        if (data.score !== undefined) lines.push(`Puntuacion: ${data.score.toLocaleString('es-AR')}`);
        lines.push(SITE_URL);
        return lines.join('\n');
    }

    // ── Build data por juego ──
    function buildMatch3Data(level, score, movesLeft) {
        return {
            title: 'Match 3',
            stats: [
                { label: 'Nivel', value: level },
                { label: 'Movimientos restantes', value: movesLeft }
            ],
            score
        };
    }

    function buildMatch3GameOverData(level, score) {
        return {
            title: 'Match 3',
            stats: [
                { label: 'Nivel alcanzado', value: level }
            ],
            score
        };
    }

    function buildMemotestData(difficulty, moves, time, score, stars) {
        const diffLabel = DIFF_LABELS[difficulty] || difficulty;
        const starsStr = '\u2B50'.repeat(stars) + '\u2606'.repeat(3 - stars);
        return {
            title: 'Memotest',
            stats: [
                { label: 'Dificultad', value: `${diffLabel} ${starsStr}` },
                { label: 'Movimientos', value: moves },
                { label: 'Tiempo', value: time }
            ],
            score
        };
    }

    function buildSudokuData(difficulty, time, errors, score) {
        const diffLabel = DIFF_LABELS[difficulty] || difficulty;
        return {
            title: 'Sudoku',
            stats: [
                { label: 'Dificultad', value: diffLabel },
                { label: 'Tiempo', value: time },
                { label: 'Errores', value: errors }
            ],
            score
        };
    }

    // ── Crea botones de share y los inserta en el overlay ──
    function createShareButtons(game, data) {
        const container = document.createElement('div');
        container.className = 'share-buttons';

        // Generar imagen
        const canvas = generateImage(game, data);
        const imgDataUrl = canvas.toDataURL('image/png');
        const text = buildText(game, data);

        // Web Share API (mobile native)
        if (navigator.share && navigator.canShare) {
            const blob = awaitBlob(canvas);
            const file = new File([blob], 'mini-arcade-result.png', { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
                const nativeBtn = document.createElement('button');
                nativeBtn.className = 'share-btn share-btn-native';
                nativeBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Compartir';
                nativeBtn.addEventListener('click', async () => {
                    try {
                        await navigator.share({
                            title: data.title + ' - Mini Arcade',
                            text: text,
                            url: SITE_URL,
                            files: [file]
                        });
                    } catch (e) { /* user cancelled */ }
                });
                container.appendChild(nativeBtn);
            }
        }

        // WhatsApp
        const waBtn = document.createElement('button');
        waBtn.className = 'share-btn share-btn-wa';
        waBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
        waBtn.title = 'WhatsApp';
        waBtn.addEventListener('click', () => {
            const waText = encodeURIComponent(text);
            window.open(`https://wa.me/?text=${waText}`, '_blank');
        });
        container.appendChild(waBtn);

        // Twitter / X
        const twBtn = document.createElement('button');
        twBtn.className = 'share-btn share-btn-tw';
        twBtn.innerHTML = '<i class="fa-brands fa-x-twitter"></i>';
        twBtn.title = 'X / Twitter';
        twBtn.addEventListener('click', () => {
            const twText = encodeURIComponent(text);
            window.open(`https://twitter.com/intent/tweet?text=${twText}`, '_blank');
        });
        container.appendChild(twBtn);

        // Facebook
        const fbBtn = document.createElement('button');
        fbBtn.className = 'share-btn share-btn-fb';
        fbBtn.innerHTML = '<i class="fa-brands fa-facebook-f"></i>';
        fbBtn.title = 'Facebook';
        fbBtn.addEventListener('click', () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`, '_blank');
        });
        container.appendChild(fbBtn);

        // Copiar imagen al clipboard
        const cpBtn = document.createElement('button');
        cpBtn.className = 'share-btn share-btn-copy';
        cpBtn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
        cpBtn.title = 'Copiar imagen';
        cpBtn.addEventListener('click', async () => {
            try {
                const blob = awaitBlob(canvas);
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                cpBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                cpBtn.title = 'Copiado!';
                setTimeout(() => {
                    cpBtn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
                    cpBtn.title = 'Copiar imagen';
                }, 2000);
            } catch {
                // Fallback: descargar
                downloadImage(canvas, `mini-arcade-${game}.png`);
            }
        });
        container.appendChild(cpBtn);

        return container;
    }

    // ── Helpers ──
    function awaitBlob(canvas) {
        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    }

    function downloadImage(canvas, filename) {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = filename;
        a.click();
    }

    // ── API publica ──
    return {
        /**
         * Inserta botones de share dentro de un overlay content.
         * @param {HTMLElement} overlayContent - el div.overlay-content
         * @param {string} game - 'match3' | 'memotest' | 'sudoku'
         * @param {object} data - { title, stats: [{label, value}], score }
         */
        inject(overlayContent, game, data) {
            // Remover previos
            const prev = overlayContent.querySelector('.share-buttons');
            if (prev) prev.remove();

            const btns = createShareButtons(game, data);
            overlayContent.appendChild(btns);
        },

        buildMatch3Data,
        buildMatch3GameOverData,
        buildMemotestData,
        buildSudokuData
    };

})();
