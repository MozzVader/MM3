/**
 * game.js — 2048 Gemas (Mini Arcade)
 * Logica del juego 2048 con skin de gemas.
 */
const Game2048 = (() => {

    // ── Config ──
    const SIZE = 4;

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

    function getGem(val) { return GEMS[val] || SUPER_GEMS[val] || { name: val.toString(), color: '#ffffff', bg: 'rgba(255,255,255,0.1)', glow: '0 0 20px rgba(255,255,255,0.3)' }; }

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

            // Track merged positions (convert line index → grid coords)
            result.mergedCols.forEach(col => {
                const pos = lineToGrid(dir, i, col);
                mergedTiles.push(`${pos.r}-${pos.c}`);
            });
        }

        // Check if anything actually moved
        let moved = false;
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (grid[r][c] !== oldGrid[r][c]) { moved = true; break; }

        if (!moved) return;

        score += mergeScore;
        moveCount++;
        spawnTile();

        // Track best gem
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] > bestGemValue) {
                    bestGemValue = grid[r][c];
                    bestGem = getGem(grid[r][c]).name;
                }
            }
        }

        // Best score
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('2048_best', bestScore.toString());
        }

        render();
        updateUI();

        // Win check (only first time)
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

        // Game over check
        if (isGameOver()) {
            gameActive = false;
            setTimeout(() => showGameOverOverlay(), 350);
        }
    }

    function processRow(row) {
        // Remove zeros (slide)
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

        // Pad with zeros
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
        // Any empty cell?
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (grid[r][c] === 0) return false;

        // Any adjacent equal cells?
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
        const cells = gridEl.children;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const cell = cells[r * SIZE + c];
                const val = grid[r][c];
                const key = `${r}-${c}`;

                // Reset
                cell.className = 'cell-2048';
                cell.style.cssText = '';

                if (val === 0) {
                    cell.innerHTML = '';
                    continue;
                }

                const gem = getGem(val);
                cell.classList.add(`tile-${Math.min(val, 2048)}`);
                if (val > 2048) cell.classList.add('tile-super');

                // Animation classes
                if (newTiles.includes(key)) cell.classList.add('tile-new');
                if (mergedTiles.includes(key)) cell.classList.add('tile-merged');

                // Apply gem styles
                cell.style.background = gem.bg;
                cell.style.color = gem.color;
                cell.style.boxShadow = gem.glow !== 'none' ? gem.glow : '';

                // Content
                const numSpan = document.createElement('span');
                numSpan.className = 'tile-value';
                numSpan.textContent = val;
                cell.appendChild(numSpan);

                // Gem name (show for 128+ or super gems)
                if (val >= 128) {
                    const gemName = document.createElement('span');
                    gemName.className = 'tile-name';
                    gemName.textContent = gem.name;
                    cell.appendChild(gemName);
                }
            }
        }
    }

    // ── UI Updates ──
    function updateUI() {
        if (scoreEl) scoreEl.textContent = score.toLocaleString('es-AR');
        if (bestEl) bestEl.textContent = bestScore.toLocaleString('es-AR');
        if (movesEl) movesEl.textContent = moveCount;
        if (bestGemEl) bestGemEl.textContent = bestGem || '--';
    }

    // ── Overlays ──
    function showWinOverlay() {
        const overlay = document.getElementById('win-overlay');
        overlay.classList.add('active');

        // Fill stats
        document.getElementById('final-score').textContent = score.toLocaleString('es-AR');
        document.getElementById('final-moves').textContent = moveCount;
        document.getElementById('final-gem').textContent = bestGem;

        // Share
        if (typeof MiniShare !== 'undefined') {
            const el = overlay.querySelector('.overlay-content');
            MiniShare.inject(el, '2048', MiniShare.build2048Data(score, moveCount, bestGem, true));
        }
    }

    function showGameOverOverlay() {
        const overlay = document.getElementById('gameover-overlay');
        overlay.classList.add('active');

        document.getElementById('go-score').textContent = score.toLocaleString('es-AR');
        document.getElementById('go-moves').textContent = moveCount;
        document.getElementById('go-gem').textContent = bestGem;

        // Share
        if (typeof MiniShare !== 'undefined') {
            const el = overlay.querySelector('.overlay-content');
            MiniShare.inject(el, '2048', MiniShare.build2048Data(score, moveCount, bestGem, false));
        }
    }

    function hideOverlay(id) {
        document.getElementById(id).classList.remove('active');
    }

    // ── Screen switching ──
    function showScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${name}-screen`).classList.add('active');
        
        // Update start screen best score when going back to menu
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

    return { getGem };
})();
