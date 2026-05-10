(function() {
    'use strict';

    // ==========================================
    // HELPERS
    // ==========================================
    const $ = id => document.getElementById(id);
    const qs = sel => document.querySelector(sel);
    const qsa = sel => document.querySelectorAll(sel);

    // ==========================================
    // 1. EL TABLERO BASE (La semilla)
    // ==========================================
    const tableroBase = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5]
    ];

    function copiarTablero(tablero) {
        return tablero.map(fila => [...fila]);
    }

    // ==========================================
    // 2. EL BARAJADOR
    // ==========================================
    function barajarTablero(tablero) {
        let t = copiarTablero(tablero);

        // A. Reasignar numeros aleatoriamente
        let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
        let mapa = {};
        for (let i = 0; i < 9; i++) mapa[i+1] = nums[i];
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                t[r][c] = mapa[t[r][c]];

        // B. Mezclar filas dentro de cada bloque horizontal
        for (let b = 0; b < 9; b += 3) {
            let filas = [t[b], t[b+1], t[b+2]].sort(() => Math.random() - 0.5);
            t[b] = filas[0]; t[b+1] = filas[1]; t[b+2] = filas[2];
        }

        // C. Mezclar columnas (transponer, mezclar, transponer)
        let tr = t[0].map((_, c) => t.map(f => f[c]));
        for (let b = 0; b < 9; b += 3) {
            let cols = [tr[b], tr[b+1], tr[b+2]].sort(() => Math.random() - 0.5);
            tr[b] = cols[0]; tr[b+1] = cols[1]; tr[b+2] = cols[2];
        }
        t = tr[0].map((_, c) => tr.map(f => f[c]));

        // D. Mezclar bandas horizontales
        let bandas = [[0,1,2],[3,4,5],[6,7,8]].sort(() => Math.random() - 0.5);
        let tmp = [];
        for (let b of bandas) tmp.push(t[b[0]], t[b[1]], t[b[2]]);
        t = tmp;

        // E. Mezclar bandas verticales
        let bandasV = [[0,1,2],[3,4,5],[6,7,8]].sort(() => Math.random() - 0.5);
        let tr2 = t[0].map((_, c) => t.map(f => f[c]));
        let tmp2 = [];
        for (let b of bandasV) tmp2.push(tr2[b[0]], tr2[b[1]], tr2[b[2]]);
        tr2 = tmp2;
        t = tr2[0].map((_, c) => tr2.map(f => f[c]));

        return t;
    }

    // ==========================================
    // 3. RESOLVEDOR (Backtracking)
    // ==========================================
    function esValido(tablero, fila, col, num) {
        for (let i = 0; i < 9; i++) {
            if (tablero[fila][i] === num) return false;
            if (tablero[i][col] === num) return false;
        }
        let sr = Math.floor(fila/3)*3, sc = Math.floor(col/3)*3;
        for (let r = sr; r < sr+3; r++)
            for (let c = sc; c < sc+3; c++)
                if (tablero[r][c] === num) return false;
        return true;
    }

    function resolverSudoku(tablero) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (tablero[r][c] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (esValido(tablero, r, c, num)) {
                            tablero[r][c] = num;
                            if (resolverSudoku(tablero)) return true;
                            tablero[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function contarSoluciones(tablero, limite = 2) {
        let count = 0;
        function solve(t) {
            if (count >= limite) return;
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (t[r][c] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (esValido(t, r, c, num)) {
                                t[r][c] = num;
                                solve(t);
                                if (count >= limite) return;
                                t[r][c] = 0;
                            }
                        }
                        return;
                    }
                }
            }
            count++;
        }
        solve(tablero);
        return count;
    }

    // ==========================================
    // 4. EL TALADRADOR (solucion unica)
    // ==========================================
    function crearHuecos(tableroResuelto, cantidad) {
        let tablero = copiarTablero(tableroResuelto);
        let huecos = cantidad;
        let celdas = [];
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                celdas.push([r, c]);
        // Fisher-Yates shuffle
        for (let i = celdas.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [celdas[i], celdas[j]] = [celdas[j], celdas[i]];
        }

        for (let [r, c] of celdas) {
            if (huecos <= 0) break;
            let backup = tablero[r][c];
            tablero[r][c] = 0;

            if (contarSoluciones(copiarTablero(tablero)) === 1) {
                huecos--;
            } else {
                tablero[r][c] = backup;
            }
        }
        return tablero;
    }

    // ==========================================
    // 5. GENERADOR FINAL
    // ==========================================
    const DIFICULTADES = {
        easy:   { huecos: 36, label: 'Facil',   maxErrors: 3, hints: 5, baseScore: 1000 },
        medium: { huecos: 46, label: 'Medio',   maxErrors: 3, hints: 3, baseScore: 2500 },
        hard:   { huecos: 54, label: 'Dificil', maxErrors: 3, hints: 1, baseScore: 5000 }
    };

    function generaSudoku(dificultad = 'easy') {
        let config = DIFICULTADES[dificultad];
        let resuelto = barajarTablero(tableroBase);
        let puzzle = crearHuecos(resuelto, config.huecos);
        return { puzzle, solucion: resuelto };
    }

    // ==========================================
    // GAME STATE
    // ==========================================
    let gameState = {
        puzzle: null,       // tablero actual (con ceros = vacios)
        solucion: null,     // tablero completo
        original: null,     // celdas dadas (no editables)
        notes: null,        // notas por celda [r][c] = Set of numbers
        selected: null,     // {r, c} o null
        difficulty: 'easy',
        timer: 0,
        timerInterval: null,
        errors: 0,
        maxErrors: 3,
        hints: 3,
        notesMode: false,
        playing: false
    };

    // ==========================================
    // UI RENDERING
    // ==========================================
    function buildGrid() {
        const grid = $('sudoku-grid');
        grid.innerHTML = '';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                let cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Bordes gruesos para cajas 3x3
                if (c % 3 === 0 && c !== 0) cell.classList.add('border-left');
                if (r % 3 === 0 && r !== 0) cell.classList.add('border-top');

                // Contenedor de valor
                let valueSpan = document.createElement('span');
                valueSpan.className = 'cell-value';
                cell.appendChild(valueSpan);

                // Contenedor de notas (3x3 mini-grid)
                let notesDiv = document.createElement('div');
                notesDiv.className = 'cell-notes';
                for (let n = 1; n <= 9; n++) {
                    let noteSpan = document.createElement('span');
                    noteSpan.className = 'note-num';
                    noteSpan.dataset.note = n;
                    notesDiv.appendChild(noteSpan);
                }
                cell.appendChild(notesDiv);

                cell.addEventListener('click', () => selectCell(r, c));
                grid.appendChild(cell);
            }
        }
    }

    function renderBoard() {
        const cells = qsa('.sudoku-cell');
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            const val = gameState.puzzle[r][c];
            const isOriginal = gameState.original[r][c];
            const valueSpan = cell.querySelector('.cell-value');
            const notesDiv = cell.querySelector('.cell-notes');

            // Reset classes
            cell.classList.remove('cell-given', 'cell-user', 'cell-error', 'cell-selected', 'cell-highlight', 'cell-same-number');

            if (isOriginal) {
                valueSpan.textContent = val;
                valueSpan.style.display = '';
                notesDiv.style.display = 'none';
                cell.classList.add('cell-given');
            } else if (val !== 0) {
                valueSpan.textContent = val;
                valueSpan.style.display = '';
                notesDiv.style.display = 'none';
                cell.classList.add('cell-user');
                // Check if wrong
                if (val !== gameState.solucion[r][c]) {
                    cell.classList.add('cell-error');
                }
            } else {
                valueSpan.textContent = '';
                valueSpan.style.display = 'none';
                // Show notes
                const cellNotes = gameState.notes[r][c];
                if (cellNotes && cellNotes.size > 0) {
                    notesDiv.style.display = 'grid';
                    notesDiv.querySelectorAll('.note-num').forEach(ns => {
                        const n = parseInt(ns.dataset.note);
                        ns.textContent = cellNotes.has(n) ? n : '';
                    });
                } else {
                    notesDiv.style.display = 'none';
                }
            }
        });

        highlightRelated();
    }

    function selectCell(r, c) {
        if (!gameState.playing) return;
        gameState.selected = { r, c };
        highlightRelated();
    }

    function highlightRelated() {
        const cells = qsa('.sudoku-cell');
        cells.forEach(cell => {
            cell.classList.remove('cell-selected', 'cell-highlight', 'cell-same-number');
        });

        if (!gameState.selected) return;
        const { r: sr, c: sc } = gameState.selected;
        const selCell = qs(`.sudoku-cell[data-row="${sr}"][data-col="${sc}"]`);
        if (selCell) selCell.classList.add('cell-selected');

        const selVal = gameState.puzzle[sr][sc];
        const boxR = Math.floor(sr/3)*3, boxC = Math.floor(sc/3)*3;

        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            if (r === sr || c === sc || (Math.floor(r/3)*3 === boxR && Math.floor(c/3)*3 === boxC)) {
                cell.classList.add('cell-highlight');
            }
            if (selVal !== 0 && gameState.puzzle[r][c] === selVal && !(r === sr && c === sc)) {
                cell.classList.add('cell-same-number');
            }
        });
    }

    // ==========================================
    // GAME ACTIONS
    // ==========================================
    function placeNumber(num) {
        if (!gameState.playing || !gameState.selected) return;
        const { r, c } = gameState.selected;
        if (gameState.original[r][c]) return; // can't edit given cells

        if (gameState.notesMode) {
            // Toggle note
            if (gameState.puzzle[r][c] !== 0) return; // can't note on filled cell
            if (!gameState.notes[r][c]) gameState.notes[r][c] = new Set();
            if (gameState.notes[r][c].has(num)) {
                gameState.notes[r][c].delete(num);
            } else {
                gameState.notes[r][c].add(num);
            }
            renderBoard();
            return;
        }

        // Place value
        gameState.puzzle[r][c] = num;
        gameState.notes[r][c] = null; // clear notes on this cell

        // Clear notes in related cells that have this number
        for (let i = 0; i < 9; i++) {
            clearNote(r, i, num);
            clearNote(i, c, num);
        }
        let sr = Math.floor(r/3)*3, sc = Math.floor(c/3)*3;
        for (let dr = 0; dr < 3; dr++)
            for (let dc = 0; dc < 3; dc++)
                clearNote(sr+dr, sc+dc, num);

        // Check if correct
        if (num !== gameState.solucion[r][c]) {
            gameState.errors++;
            $('error-count').textContent = gameState.errors + '/' + gameState.maxErrors;
            if (gameState.errors >= gameState.maxErrors) {
                gameOver();
                return;
            }
        }

        renderBoard();
        checkWin();
    }

    function clearNote(r, c, num) {
        if (gameState.notes[r] && gameState.notes[r][c]) {
            gameState.notes[r][c].delete(num);
        }
    }

    function eraseCell() {
        if (!gameState.playing || !gameState.selected) return;
        const { r, c } = gameState.selected;
        if (gameState.original[r][c]) return;
        gameState.puzzle[r][c] = 0;
        gameState.notes[r][c] = null;
        renderBoard();
    }

    function useHint() {
        if (!gameState.playing || gameState.hints <= 0) return;
        if (!gameState.selected) return;
        const { r, c } = gameState.selected;
        if (gameState.original[r][c]) return;
        if (gameState.puzzle[r][c] === gameState.solucion[r][c]) return; // already correct

        gameState.puzzle[r][c] = gameState.solucion[r][c];
        gameState.notes[r][c] = null;
        gameState.hints--;
        $('hints-left').textContent = gameState.hints;

        renderBoard();
        checkWin();
    }

    function toggleNotesMode() {
        gameState.notesMode = !gameState.notesMode;
        const btn = $('btn-notes-toggle');
        if (gameState.notesMode) {
            btn.classList.add('notes-active');
        } else {
            btn.classList.remove('notes-active');
        }
    }

    // ==========================================
    // WIN / LOSE
    // ==========================================
    function checkWin() {
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                if (gameState.puzzle[r][c] !== gameState.solucion[r][c]) return;
        // WIN!
        stopTimer();
        gameState.playing = false;
        const config = DIFICULTADES[gameState.difficulty];
        const score = calculateScore();
        saveHighScore(score);
        saveScoreToSupabase(score);

        $('final-time').textContent = formatTime(gameState.timer);
        $('final-diff').textContent = config.label;
        $('final-errors').textContent = gameState.errors;
        $('final-score').textContent = score;
        showOverlay($('win-overlay'));
        MiniShare.inject($('win-overlay').querySelector('.overlay-content'), 'sudoku',
            MiniShare.buildSudokuData(gameState.difficulty, formatTime(gameState.timer), gameState.errors, score));
    }

    function gameOver() {
        stopTimer();
        gameState.playing = false;
        const config = DIFICULTADES[gameState.difficulty];
        showOverlay($('gameover-overlay'));
        MiniShare.inject($('gameover-overlay').querySelector('.overlay-content'), 'sudoku',
            MiniShare.buildSudokuData(gameState.difficulty, formatTime(gameState.timer), gameState.errors, null));
    }

    function calculateScore() {
        const config = DIFICULTADES[gameState.difficulty];
        const timePenalty = Math.floor(gameState.timer * 2);
        const errorPenalty = gameState.errors * 200;
        const hintPenalty = (config.hints - gameState.hints) * 150;
        return Math.max(0, config.baseScore + Math.floor(config.huecos * 50) - timePenalty - errorPenalty - hintPenalty);
    }

    // ==========================================
    // TIMER
    // ==========================================
    function startTimer() {
        gameState.timer = 0;
        updateTimerDisplay();
        gameState.timerInterval = setInterval(() => {
            if (!gameState.playing) return;
            gameState.timer++;
            updateTimerDisplay();
        }, 1000);
    }

    function stopTimer() {
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
    }

    function updateTimerDisplay() {
        $('timer').textContent = formatTime(gameState.timer);
    }

    function formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return m.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');
    }

    // ==========================================
    // HIGH SCORE (localStorage)
    // ==========================================
    function getHighScoreKey() {
        return 'sudoku_best_' + gameState.difficulty;
    }

    function saveHighScore(score) {
        const key = getHighScoreKey();
        const best = localStorage.getItem(key);
        if (!best || gameState.timer < parseInt(best)) {
            localStorage.setItem(key, gameState.timer.toString());
        }
        // Also save overall best
        const overallKey = 'sudoku_best_time';
        const ob = localStorage.getItem(overallKey);
        if (!ob || gameState.timer < parseInt(ob)) {
            localStorage.setItem(overallKey, gameState.timer.toString());
        }
        updateHighScoreDisplay();
    }

    function updateHighScoreDisplay() {
        const key = getHighScoreKey();
        const best = localStorage.getItem(key);
        $('high-score-value').textContent = best ? formatTime(parseInt(best)) : '--:--';
    }

    // ==========================================
    // SUPABASE SCORING
    // ==========================================
    async function saveScoreToSupabase(score) {
        try {
            if (typeof sb === 'undefined' || !sb) return;
            const { data: { session } } = await sb.auth.getSession();
            if (!session?.user) return;

            const payload = {
                user_id: session.user.id,
                game_slug: 'sudoku',
                score: Number(score),
                level: null,
                metadata: {
                    difficulty: gameState.difficulty,
                    time: gameState.timer,
                    errors: gameState.errors,
                    hints_used: DIFICULTADES[gameState.difficulty].hints - gameState.hints,
                    completed: true
                },
            };

            console.log('[sudoku] Saving score payload:', JSON.stringify(payload));
            const { data, error } = await sb.from('game_scores').insert(payload);

            if (error) {
                console.error('[sudoku] Supabase insert FAILED:', error.code, error.message, error.details);
            } else {
                console.log('[sudoku] Score saved to Supabase:', data);
            }
        } catch (e) {
            console.error('[sudoku] Exception saving score:', e);
        }
    }

    // ==========================================
    // OVERLAY HELPERS
    // ==========================================
    function showOverlay(el) {
        el.style.display = 'flex';
        setTimeout(() => el.classList.add('active'), 10);
    }

    function hideOverlay(el) {
        el.classList.remove('active');
        setTimeout(() => el.style.display = 'none', 200);
    }

    function showScreen(id) {
        qsa('.screen').forEach(s => s.classList.remove('active'));
        $(id).classList.add('active');
    }

    // ==========================================
    // START / NEW GAME
    // ==========================================
    function startGame(difficulty) {
        gameState.difficulty = difficulty || gameState.difficulty;
        const config = DIFICULTADES[gameState.difficulty];
        const { puzzle, solucion } = generaSudoku(gameState.difficulty);

        gameState.puzzle = puzzle;
        gameState.solucion = solucion;
        gameState.original = puzzle.map(fila => fila.map(v => v !== 0));
        gameState.notes = Array.from({ length: 9 }, () => Array(9).fill(null));
        gameState.selected = null;
        gameState.errors = 0;
        gameState.hints = config.hints;
        gameState.notesMode = false;
        gameState.playing = true;

        // Update UI
        $('current-diff').textContent = config.label;
        $('diff-badge').textContent = config.label.toUpperCase();
        $('error-count').textContent = '0/' + config.maxErrors;
        $('hints-left').textContent = config.hints;
        $('btn-notes-toggle').classList.remove('notes-active');

        buildGrid();
        renderBoard();
        startTimer();
        showScreen('game-screen');
    }

    // ==========================================
    // KEYBOARD SUPPORT
    // ==========================================
    function handleKeydown(e) {
        if (!gameState.playing) return;

        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
            e.preventDefault();
            placeNumber(num);
            // Highlight numpad button
            const btn = qs(`.numpad-btn[data-num="${num}"]`);
            if (btn) btn.classList.add('numpad-press');
            setTimeout(() => { if (btn) btn.classList.remove('numpad-press'); }, 150);
            return;
        }

        if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            eraseCell();
            return;
        }

        // Arrow keys to navigate
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key) && gameState.selected) {
            e.preventDefault();
            let { r, c } = gameState.selected;
            if (e.key === 'ArrowUp') r = Math.max(0, r-1);
            if (e.key === 'ArrowDown') r = Math.min(8, r+1);
            if (e.key === 'ArrowLeft') c = Math.max(0, c-1);
            if (e.key === 'ArrowRight') c = Math.min(8, c+1);
            selectCell(r, c);
        }
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    function init() {
        // Difficulty buttons on start screen
        qsa('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                qsa('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.difficulty = btn.dataset.diff;
                updateHighScoreDisplay();
            });
        });

        $('btn-new-game').addEventListener('click', () => startGame());

        // Numpad
        qsa('.numpad-btn[data-num]').forEach(btn => {
            btn.addEventListener('click', () => {
                placeNumber(parseInt(btn.dataset.num));
            });
        });

        $('btn-erase').addEventListener('click', eraseCell);
        $('btn-hint').addEventListener('click', useHint);
        $('btn-notes-toggle').addEventListener('click', toggleNotesMode);

        // In-game controls
        $('btn-new-ingame').addEventListener('click', () => {
            stopTimer();
            hideOverlay($('win-overlay'));
            hideOverlay($('gameover-overlay'));
            startGame();
        });

        $('btn-back-menu').addEventListener('click', () => {
            stopTimer();
            gameState.playing = false;
            showScreen('start-screen');
            updateHighScoreDisplay();
        });

        $('btn-play-again').addEventListener('click', () => {
            hideOverlay($('win-overlay'));
            startGame();
        });

        $('btn-back-menu-2').addEventListener('click', () => {
            hideOverlay($('win-overlay'));
            gameState.playing = false;
            showScreen('start-screen');
            updateHighScoreDisplay();
        });

        $('btn-retry').addEventListener('click', () => {
            hideOverlay($('gameover-overlay'));
            startGame();
        });

        $('btn-back-menu-3').addEventListener('click', () => {
            hideOverlay($('gameover-overlay'));
            gameState.playing = false;
            showScreen('start-screen');
            updateHighScoreDisplay();
        });

        // Keyboard
        document.addEventListener('keydown', handleKeydown);

        // Init high score display
        updateHighScoreDisplay();
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
