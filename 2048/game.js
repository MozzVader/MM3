/**
 * game.js — 2048 (Mini Arcade)
 * Logica del juego 2048 con skins: Gemas y LED Retro Display.
 */
const Game2048 = (() => {

    // ── Config ──
    const SIZE = 4;

    // ── Gem Skin ──
    const GEMS = {
        2:    { name: 'Cuarzo',     color: '#a8d8ea', bg: 'rgba(168,216,234,0.12)',  glow: 'none' },
        4:    { name: 'Ambar',      color: '#f4c430', bg: 'rgba(244,196,48,0.15)',   glow: '0 0 6px rgba(244,196,48,0.3)' },
        8:    { name: 'Topacio',    color: '#ff8c00', bg: 'rgba(255,140,0,0.18)',    glow: '0 0 10px rgba(255,140,0,0.3)' },
        16:   { name: 'Rubi',       color: '#e94560', bg: 'rgba(233,69,96,0.2)',     glow: '0 0 12px rgba(233,69,96,0.35)' },
        32:   { name: 'Esmeralda',  color: '#00c853', bg: 'rgba(0,200,83,0.2)',      glow: '0 0 14px rgba(0,200,83,0.35)' },
        64:   { name: 'Zafiro',     color: '#42a5f5', bg: 'rgba(66,165,245,0.22)',   glow: '0 0 16px rgba(66,165,245,0.35)' },
        128:  { name: 'Amatista',   color: '#b388ff', bg: 'rgba(179,136,255,0.22)',  glow: '0 0 20px rgba(179,136,255,0.35)' },
        256:  { name: 'Diamante',   color: '#e0f7fa', bg: 'rgba(224,247,250,0.18)',  glow: '0 0 24px rgba(224,247,250,0.4)' },
        512:  { name: 'Opalo',      color: '#ff6ec7', bg: 'rgba(255,110,199,0.2)',   glow: '0 0 28px rgba(255,110,199,0.4)' },
        1024: { name: 'Estrella',   color: '#ffd700', bg: 'rgba(255,215,0,0.2)',     glow: '0 0 32px rgba(255,215,0,0.4)' },
        2048: { name: 'Legendaria', color: '#ffffff', bg: 'rgba(255,107,53,0.25)',   glow: '0 0 40px rgba(255,107,53,0.6), 0 0 80px rgba(255,107,53,0.3)' }
    };

    const SUPER_GEMS = {
        4096:  { name: 'Cosmica',    color: '#ff4081', bg: 'rgba(255,64,129,0.25)',  glow: '0 0 40px rgba(255,64,129,0.5), 0 0 80px rgba(255,64,129,0.2)' },
        8192:  { name: 'Mistica',    color: '#7c4dff', bg: 'rgba(124,77,255,0.25)',  glow: '0 0 40px rgba(124,77,255,0.5), 0 0 80px rgba(124,77,255,0.2)' }
    };

    // ── LED Skin ──
    const LEDS = {
        2:    { name: 'LO',    color: '#39ff14', bg: 'rgba(57,255,20,0.08)',   glow: '0 0 8px rgba(57,255,20,0.4), inset 0 0 6px rgba(57,255,20,0.1)' },
        4:    { name: 'LO',    color: '#39ff14', bg: 'rgba(57,255,20,0.12)',   glow: '0 0 12px rgba(57,255,20,0.5), inset 0 0 8px rgba(57,255,20,0.15)' },
        8:    { name: 'MED',   color: '#00ff88', bg: 'rgba(0,255,136,0.1)',    glow: '0 0 14px rgba(0,255,136,0.45), inset 0 0 8px rgba(0,255,136,0.12)' },
        16:   { name: 'MED',   color: '#00e5ff', bg: 'rgba(0,229,255,0.1)',    glow: '0 0 16px rgba(0,229,255,0.45), inset 0 0 10px rgba(0,229,255,0.12)' },
        32:   { name: 'MED',   color: '#ffab00', bg: 'rgba(255,171,0,0.12)',   glow: '0 0 18px rgba(255,171,0,0.5), inset 0 0 10px rgba(255,171,0,0.15)' },
        64:   { name: 'HI',    color: '#ff6d00', bg: 'rgba(255,109,0,0.14)',   glow: '0 0 20px rgba(255,109,0,0.5), inset 0 0 12px rgba(255,109,0,0.15)' },
        128:  { name: 'HI',    color: '#ff1744', bg: 'rgba(255,23,68,0.15)',   glow: '0 0 24px rgba(255,23,68,0.55), inset 0 0 14px rgba(255,23,68,0.18)' },
        256:  { name: 'HI',    color: '#ff4081', bg: 'rgba(255,64,129,0.15)',  glow: '0 0 28px rgba(255,64,129,0.55), inset 0 0 14px rgba(255,64,129,0.18)' },
        512:  { name: 'MAX',   color: '#d500f9', bg: 'rgba(213,0,249,0.15)',   glow: '0 0 30px rgba(213,0,249,0.55), inset 0 0 16px rgba(213,0,249,0.18)' },
        1024: { name: 'MAX',   color: '#ffea00', bg: 'rgba(255,234,0,0.12)',   glow: '0 0 34px rgba(255,234,0,0.5), inset 0 0 16px rgba(255,234,0,0.15)' },
        2048: { name: 'JACKPOT', color: '#ffffff', bg: 'rgba(255,107,53,0.2)', glow: '0 0 40px rgba(255,107,53,0.7), 0 0 80px rgba(255,107,53,0.3), inset 0 0 20px rgba(255,107,53,0.2)' }
    };

    const SUPER_LEDS = {
        4096:  { name: 'JACKPOT', color: '#ff4081', bg: 'rgba(255,64,129,0.2)', glow: '0 0 40px rgba(255,64,129,0.6), 0 0 80px rgba(255,64,129,0.25), inset 0 0 20px rgba(255,64,129,0.2)' },
        8192:  { name: 'JACKPOT', color: '#7c4dff', bg: 'rgba(124,77,255,0.2)', glow: '0 0 40px rgba(124,77,255,0.6), 0 0 80px rgba(124,77,255,0.25), inset 0 0 20px rgba(124,77,255,0.2)' }
    };

    // ── Tile lookup ──
    function getTile(val) {
        if (currentSkin === 'led') {
            return LEDS[val] || SUPER_LEDS[val] || { name: val.toString(), color: '#ffffff', bg: 'rgba(255,255,255,0.08)', glow: '0 0 20px rgba(255,255,255,0.3)' };
        }
        return GEMS[val] || SUPER_GEMS[val] || { name: val.toString(), color: '#ffffff', bg: 'rgba(255,255,255,0.1)', glow: '0 0 20px rgba(255,255,255,0.3)' };
    }

    // ── Skin Management ──
    const LS_SKIN = '2048_skin';
    let currentSkin = 'gems'; // 'gems' | 'led'

    function loadSkin() {
        currentSkin = localStorage.getItem(LS_SKIN) || 'gems';
    }

    function setSkin(skin) {
        currentSkin = skin;
        localStorage.setItem(LS_SKIN, skin);
        applySkinToUI();

        // Re-render board if in game
        if (grid) render();
    }

    function toggleSkin() {
        setSkin(currentSkin === 'gems' ? 'led' : 'gems');
    }

    function applySkinToUI() {
        const isLED = currentSkin === 'led';

        // Start screen button
        const skinNameEl = document.getElementById('active-skin-name');
        if (skinNameEl) skinNameEl.textContent = isLED ? 'LED Retro' : 'Gemas';

        // Start screen subtitle
        const subtitleEl = document.getElementById('game-subtitle-text');
        if (subtitleEl) subtitleEl.textContent = isLED ? 'Display Retro' : 'Fusion de Gemas';

        // Start screen decorations
        const decosEl = document.getElementById('start-decorations');
        if (decosEl) {
            if (isLED) {
                decosEl.className = 'start-decorations-2048 led-decorations';
                decosEl.innerHTML = `
                    <div class="deco-led" style="--led-c:#39ff14">2</div>
                    <div class="deco-led" style="--led-c:#00ff88">8</div>
                    <div class="deco-led" style="--led-c:#ffab00">32</div>
                    <div class="deco-led" style="--led-c:#ff1744">128</div>
                    <div class="deco-led" style="--led-c:#d500f9">512</div>
                    <div class="deco-led" style="--led-c:#ffffff">2048</div>
                `;
            } else {
                decosEl.className = 'start-decorations-2048';
                decosEl.innerHTML = `
                    <div class="deco-gem">2</div>
                    <div class="deco-gem">4</div>
                    <div class="deco-gem">16</div>
                    <div class="deco-gem">64</div>
                    <div class="deco-gem">128</div>
                    <div class="deco-gem">2048</div>
                `;
            }
        }

        // Game screen badge
        const badgeEl = document.getElementById('skin-badge');
        if (badgeEl) {
            if (isLED) {
                badgeEl.textContent = 'LED';
                badgeEl.style.background = 'rgba(57,255,20,0.15)';
                badgeEl.style.color = '#39ff14';
                badgeEl.style.borderColor = 'rgba(57,255,20,0.25)';
            } else {
                badgeEl.textContent = 'GEMAS';
                badgeEl.style.background = 'rgba(179,136,255,0.2)';
                badgeEl.style.color = '#b388ff';
                badgeEl.style.borderColor = 'rgba(179,136,255,0.2)';
            }
        }

        // Game footer
        const footerEl = document.getElementById('game-footer-text');
        if (footerEl) footerEl.textContent = isLED ? '2048 LED' : '2048 GEMAS';

        // Board class
        const boardEl = document.getElementById('grid-2048');
        if (boardEl) {
            boardEl.classList.toggle('led-board', isLED);
        }

        // Header label
        const headerLabel = document.querySelector('.best-gem-display .header-label');
        if (headerLabel) headerLabel.textContent = isLED ? 'Nivel' : 'Mejor Gema';

        // Win overlay text
        const trophyEl = document.querySelector('.gem-trophy');
        if (trophyEl) trophyEl.innerHTML = isLED ? '&#x1F3B0;' : '&#x1F48E;';
        const winTitle = document.querySelector('#win-overlay h2');
        if (winTitle) winTitle.textContent = isLED ? 'Jackpot!' : 'Gema Legendaria!';
        const winDesc = document.querySelector('#win-overlay .overlay-content > p');
        if (winDesc) winDesc.textContent = isLED ? 'Llegaste a 2048 en el display!' : 'Alcanzaste la gema 2048!';
    }

    // ── State ──
    let grid, score, bestScore, gameActive, won, keepPlaying, moveCount;
    let newTiles, mergedTiles;
    let bestGem, bestGemValue;

    // ── DOM refs ──
    let gridEl, scoreEl, bestEl, movesEl, bestGemEl;

    // ── Init ──
    function init() {
        gridEl = document.getElementById('grid-2048');
        scoreEl = document.getElementById('current-score');
        bestEl = document.getElementById('best-score');
        movesEl = document.getElementById('move-count');
        bestGemEl = document.getElementById('best-gem');

        bestScore = parseInt(localStorage.getItem('2048_best') || '0');
        if (bestEl) bestEl.textContent = bestScore.toLocaleString('es-AR');

        // Show best score on start screen too
        const hsEl = document.getElementById('high-score-value');
        if (hsEl) hsEl.textContent = bestScore.toLocaleString('es-AR');

        // Load and apply skin
        loadSkin();
        applySkinToUI();

        // Skin toggle button
        document.getElementById('btn-select-skin').addEventListener('click', toggleSkin);

        // Start screen
        document.getElementById('btn-new-game').addEventListener('click', newGame);

        // Win overlay
        document.getElementById('btn-play-again').addEventListener('click', () => {
            hideOverlay('win-overlay');
            newGame();
        });
        document.getElementById('btn-keep-playing').addEventListener('click', () => {
            keepPlaying = true;
            gameActive = true;
            hideOverlay('win-overlay');
        });
        document.getElementById('btn-back-menu-win').addEventListener('click', () => {
            hideOverlay('win-overlay');
            showScreen('start');
        });

        // Game over overlay
        document.getElementById('btn-retry').addEventListener('click', () => {
            hideOverlay('gameover-overlay');
            newGame();
        });
        document.getElementById('btn-back-menu-go').addEventListener('click', () => {
            hideOverlay('gameover-overlay');
            showScreen('start');
        });

        // In-game controls
        document.getElementById('btn-new-ingame').addEventListener('click', newGame);
        document.getElementById('btn-back-menu-ingame').addEventListener('click', () => showScreen('start'));

        // Keyboard
        document.addEventListener('keydown', handleKey);

        // Touch / swipe
        setupTouch();

        showScreen('start');
    }

    // ── New game ──
    function newGame() {
        grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        score = 0;
        gameActive = true;
        won = false;
        keepPlaying = false;
        moveCount = 0;
        newTiles = [];
        mergedTiles = [];
        bestGem = '';
        bestGemValue = 0;

        spawnTile();
        spawnTile();
        render();
        updateUI();
        showScreen('game');
    }

    // ── Spawn tile ──
    function spawnTile() {
        const empty = [];
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (grid[r][c] === 0) empty.push({ r, c });

        if (empty.length === 0) return false;
        const cell = empty[Math.floor(Math.random() * empty.length)];
        grid[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
        newTiles.push(`${cell.r}-${cell.c}`);
        return true;
    }

    // ── Move logic ──
    function move(dir) {
        if (!gameActive) return;

        const oldGrid = grid.map(r => [...r]);
        let mergeScore = 0;
        mergedTiles = [];
        newTiles = [];

        for (let i = 0; i < SIZE; i++) {
            const line = getLine(grid, dir, i);
            const result = processRow(line);
            setLine(grid, dir, i, result.row);
            mergeScore += result.score;

            result.mergedCols.forEach(col => {
                const pos = lineToGrid(dir, i, col);
                mergedTiles.push(`${pos.r}-${pos.c}`);
            });
        }

        let moved = false;
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (grid[r][c] !== oldGrid[r][c]) { moved = true; break; }

        if (!moved) return;

        score += mergeScore;
        moveCount++;
        spawnTile();

        // Track best gem / tile
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] > bestGemValue) {
                    bestGemValue = grid[r][c];
                    const tile = getTile(grid[r][c]);
                    bestGem = tile.name;
                }
            }
        }

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('2048_best', bestScore.toString());
        }

        render();
        updateUI();

        if (!won && !keepPlaying) {
            for (let r = 0; r < SIZE; r++)
                for (let c = 0; c < SIZE; c++)
                    if (grid[r][c] >= 2048) {
                        won = true;
                        gameActive = false;
                        setTimeout(() => showWinOverlay(), 350);
                        return;
                    }
        }

        if (isGameOver()) {
            gameActive = false;
            setTimeout(() => showGameOverOverlay(), 350);
        }
    }

    function processRow(row) {
        let filtered = row.filter(v => v !== 0);
        let result = [];
        let sc = 0;
        let mergedCols = [];

        let i = 0;
        while (i < filtered.length) {
            if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
                const merged = filtered[i] * 2;
                result.push(merged);
                sc += merged;
                mergedCols.push(result.length - 1);
                i += 2;
            } else {
                result.push(filtered[i]);
                i++;
            }
        }

        while (result.length < SIZE) result.push(0);
        return { row: result, score: sc, mergedCols };
    }

    // ── Direction helpers ──
    function getLine(g, dir, idx) {
        switch (dir) {
            case 'left':  return [...g[idx]];
            case 'right': return [...g[idx]].reverse();
            case 'up':    return [g[0][idx], g[1][idx], g[2][idx], g[3][idx]];
            case 'down':  return [g[3][idx], g[2][idx], g[1][idx], g[0][idx]];
        }
    }

    function setLine(g, dir, idx, line) {
        switch (dir) {
            case 'left':  g[idx] = line; break;
            case 'right': g[idx] = [...line].reverse(); break;
            case 'up':
                for (let i = 0; i < SIZE; i++) g[i][idx] = line[i];
                break;
            case 'down':
                for (let i = 0; i < SIZE; i++) g[SIZE - 1 - i][idx] = line[i];
                break;
        }
    }

    function lineToGrid(dir, idx, col) {
        switch (dir) {
            case 'left':  return { r: idx, c: col };
            case 'right': return { r: idx, c: SIZE - 1 - col };
            case 'up':    return { r: col, c: idx };
            case 'down':  return { r: SIZE - 1 - col, c: idx };
        }
    }

    // ── Game over detection ──
    function isGameOver() {
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (grid[r][c] === 0) return false;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const val = grid[r][c];
                if (c < SIZE - 1 && grid[r][c + 1] === val) return false;
                if (r < SIZE - 1 && grid[r + 1][c] === val) return false;
            }
        }
        return true;
    }

    // ── Render ──
    function render() {
        const isLED = currentSkin === 'led';
        const cells = gridEl.children;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const cell = cells[r * SIZE + c];
                const val = grid[r][c];
                const key = `${r}-${c}`;

                // Reset
                cell.className = 'cell-2048' + (isLED ? ' led-cell' : '');
                cell.style.cssText = '';
                cell.innerHTML = '';

                if (val === 0) continue;

                const tile = getTile(val);

                // Gem classes (for color fallback in CSS)
                if (!isLED) {
                    cell.classList.add(`tile-${Math.min(val, 2048)}`);
                    if (val > 2048) cell.classList.add('tile-super');
                }

                // LED classes
                if (isLED) {
                    cell.classList.add('led-active');
                    const tier = getLedTier(val);
                    if (tier) cell.classList.add(`led-${tier}`);
                    if (val >= 2048) cell.classList.add('led-jackpot');
                }

                // Animation classes
                if (newTiles.includes(key)) cell.classList.add(isLED ? 'led-flicker' : 'tile-new');
                if (mergedTiles.includes(key)) cell.classList.add(isLED ? 'led-burst' : 'tile-merged');

                // Apply styles
                cell.style.background = tile.bg;
                cell.style.color = tile.color;
                cell.style.boxShadow = tile.glow || '';

                // Content
                const numSpan = document.createElement('span');
                numSpan.className = isLED ? 'led-value' : 'tile-value';
                numSpan.textContent = val;
                cell.appendChild(numSpan);

                // Label (gem name or LED tier) — show for 128+
                if (val >= 128) {
                    const label = document.createElement('span');
                    label.className = isLED ? 'led-label' : 'tile-name';
                    label.textContent = tile.name;
                    cell.appendChild(label);
                }
            }
        }
    }

    function getLedTier(val) {
        if (val <= 4) return 'lo';
        if (val <= 32) return 'med';
        if (val <= 128) return 'hi';
        return 'max';
    }

    // ── UI Updates ──
    function updateUI() {
        if (scoreEl) scoreEl.textContent = score.toLocaleString('es-AR');
        if (bestEl) bestEl.textContent = bestScore.toLocaleString('es-AR');
        if (movesEl) movesEl.textContent = moveCount;
        if (bestGemEl) bestGemEl.textContent = bestGem || '--';
    }

    // ── Supabase Scoring ──
    async function saveScoreToSupabase(reason) {
        try {
            if (typeof sb === 'undefined' || !sb) return;
            const { data: { session } } = await sb.auth.getSession();
            if (!session?.user) return;

            const payload = {
                user_id: session.user.id,
                game_slug: '2048',
                score: Number(score),
                level: null,
                metadata: {
                    reason,                    // 'win' | 'game_over'
                    moves: moveCount,
                    best_tile: bestGemValue,
                    best_tile_name: bestGem,
                    skin: currentSkin,
                },
            };

            console.log('[2048] Saving score payload:', JSON.stringify(payload));
            const { data, error } = await sb.from('game_scores').insert(payload);

            if (error) {
                console.error('[2048] Supabase insert FAILED:', error.code, error.message, error.details);
            } else {
                console.log('[2048] Score saved to Supabase:', data);
            }
        } catch (e) {
            console.error('[2048] Exception saving score:', e);
        }
    }

    // ── Overlays ──
    function showWinOverlay() {
        const overlay = document.getElementById('win-overlay');
        overlay.classList.add('active');

        document.getElementById('final-score').textContent = score.toLocaleString('es-AR');
        document.getElementById('final-moves').textContent = moveCount;
        document.getElementById('final-gem').textContent = bestGem;

        if (typeof MiniShare !== 'undefined') {
            const el = overlay.querySelector('.overlay-content');
            MiniShare.inject(el, '2048', MiniShare.build2048Data(score, moveCount, bestGem, true));
        }

        saveScoreToSupabase('win');
    }

    function showGameOverOverlay() {
        const overlay = document.getElementById('gameover-overlay');
        overlay.classList.add('active');

        document.getElementById('go-score').textContent = score.toLocaleString('es-AR');
        document.getElementById('go-moves').textContent = moveCount;
        document.getElementById('go-gem').textContent = bestGem;

        if (typeof MiniShare !== 'undefined') {
            const el = overlay.querySelector('.overlay-content');
            MiniShare.inject(el, '2048', MiniShare.build2048Data(score, moveCount, bestGem, false));
        }

        saveScoreToSupabase('game_over');
    }

    function hideOverlay(id) {
        document.getElementById(id).classList.remove('active');
    }

    // ── Screen switching ──
    function showScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${name}-screen`).classList.add('active');

        if (name === 'start') {
            const hsEl = document.getElementById('high-score-value');
            if (hsEl) hsEl.textContent = bestScore.toLocaleString('es-AR');
        }
    }

    // ── Controls ──
    function handleKey(e) {
        const map = {
            'ArrowLeft': 'left', 'ArrowRight': 'right',
            'ArrowUp': 'up', 'ArrowDown': 'down',
            'a': 'left', 'd': 'right', 'w': 'up', 's': 'down'
        };
        if (map[e.key]) {
            e.preventDefault();
            move(map[e.key]);
        }
    }

    function setupTouch() {
        let startX, startY;
        const el = document.getElementById('game-screen');
        if (!el) return;

        el.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        el.addEventListener('touchend', e => {
            if (startX == null || startY == null) return;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            if (Math.max(absDx, absDy) < 30) return;
            if (absDx > absDy) {
                move(dx > 0 ? 'right' : 'left');
            } else {
                move(dy > 0 ? 'down' : 'up');
            }
            startX = startY = null;
        }, { passive: true });
    }

    // ── Boot ──
    document.addEventListener('DOMContentLoaded', init);

    return { getGem: getTile, getSkin: () => currentSkin };
})();
