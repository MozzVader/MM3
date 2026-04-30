/* ============================================
   MM3 - Match 3 Puzzle - Motor del Juego
   ============================================ */

(function () {
    'use strict';

    // --- Constantes ---
    const BOARD_SIZE = 8;
    const GEM_TYPES = 6;
    const ANIMATION_SPEED = 250; // ms
    const CASCADE_DELAY = 150;   // ms entre cascadas

    // Puntos por match segun longitud
    const SCORE_MAP = { 3: 50, 4: 150, 5: 300, 6: 500 };

    // Configuracion de niveles: { target, moves, types }
    const LEVELS = [
        { target: 500,   moves: 25, types: 5 },
        { target: 1000,  moves: 22, types: 5 },
        { target: 1800,  moves: 22, types: 6 },
        { target: 2500,  moves: 20, types: 6 },
        { target: 3500,  moves: 20, types: 6 },
        { target: 5000,  moves: 18, types: 6 },
        { target: 6500,  moves: 18, types: 6 },
        { target: 8000,  moves: 16, types: 6 },
        { target: 10000, moves: 16, types: 6 },
        { target: 13000, moves: 15, types: 6 },
    ];

    // Nombres de combos
    const COMBO_NAMES = ['', '', '', 'Triple!', 'Combo x4!', 'MEGA x5!', 'ULTRA x6!'];

    // --- Estado del juego ---
    let board = [];           // board[row][col] = tipo de gem (0 a GEM_TYPES-1) o null
    let selectedGem = null;   // { row, col }
    let score = 0;
    let level = 1;
    let movesLeft = 0;
    let targetScore = 0;
    let isProcessing = false; // bloquea input durante animaciones
    let cascadeCount = 0;     // contador de cascadas para multiplicador
    let gemTypesInLevel = 6;
    let hintTimeout = null;

    // --- Referencias DOM ---
    const $ = (sel) => document.querySelector(sel);
    const startScreen = $('#start-screen');
    const gameScreen = $('#game-screen');
    const gameBoard = $('#game-board');
    const levelCompleteOverlay = $('#level-complete');
    const gameOverOverlay = $('#game-over');
    const comboMessage = $('#combo-message');

    // --- Inicializacion ---
    function init() {
        loadSavedData();
        bindEvents();
        checkContinueButton();
    }

    function bindEvents() {
        $('#btn-new-game').addEventListener('click', startNewGame);
        $('#btn-continue').addEventListener('click', continueGame);
        $('#btn-next-level').addEventListener('click', nextLevel);
        $('#btn-retry').addEventListener('click', retryLevel);
        $('#btn-back-menu').addEventListener('click', backToMenu);
    }

    // --- Persistencia (localStorage) ---
    function loadSavedData() {
        try {
            const saved = JSON.parse(localStorage.getItem('mm3_save'));
            if (saved) {
                score = saved.score || 0;
                level = saved.level || 1;
            }
        } catch (e) { /* sin datos guardados */ }

        const hs = localStorage.getItem('mm3_highscore') || 0;
        $('#high-score-value').textContent = hs;
    }

    function saveGame() {
        try {
            localStorage.setItem('mm3_save', JSON.stringify({ score, level }));
        } catch (e) { /* localStorage no disponible */ }
    }

    function saveHighScore() {
        const hs = parseInt(localStorage.getItem('mm3_highscore') || '0');
        if (score > hs) {
            localStorage.setItem('mm3_highscore', score.toString());
        }
    }

    function checkContinueButton() {
        const saved = localStorage.getItem('mm3_save');
        const btn = $('#btn-continue');
        if (saved) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
        }
    }

    // --- Navegacion de pantallas ---
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function showOverlay(overlay) {
        overlay.classList.add('active');
    }

    function hideOverlay(overlay) {
        overlay.classList.remove('active');
    }

    // --- Iniciar / Continuar Juego ---
    function startNewGame() {
        score = 0;
        level = 1;
        localStorage.removeItem('mm3_save');
        startLevel();
    }

    function continueGame() {
        loadSavedData();
        startLevel();
    }

    function startLevel() {
        const lvlConfig = getLevelConfig(level);
        targetScore = lvlConfig.target;
        movesLeft = lvlConfig.moves;
        gemTypesInLevel = lvlConfig.types;
        cascadeCount = 0;

        // Actualizar UI
        updateUI();
        showScreen(gameScreen);
        hideOverlay(levelCompleteOverlay);
        hideOverlay(gameOverOverlay);

        // Generar tablero sin matches iniciales
        generateBoard();
        renderBoard();

        // Verificar que hay movimientos validos
        if (!hasValidMoves()) {
            shuffleBoard();
        }

        resetHintTimer();
    }

    function getLevelConfig(lvl) {
        if (lvl <= LEVELS.length) {
            return LEVELS[lvl - 1];
        }
        // Generar niveles infinitos progresivos
        const base = LEVELS[LEVELS.length - 1];
        const extra = lvl - LEVELS.length;
        return {
            target: Math.floor(base.target * (1.3 ** extra)),
            moves: Math.max(10, base.moves - extra),
            types: 6
        };
    }

    function nextLevel() {
        level++;
        saveGame();
        startLevel();
    }

    function retryLevel() {
        // Al reintentar se resetea el score del nivel pero no el acumulado
        startLevel();
    }

    function backToMenu() {
        saveHighScore();
        checkContinueButton();
        $('#high-score-value').textContent = localStorage.getItem('mm3_highscore') || 0;
        hideOverlay(gameOverOverlay);
        showScreen(startScreen);
    }

    // --- Logica del Tablero ---

    function generateBoard() {
        board = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            board[r] = [];
            for (let c = 0; c < BOARD_SIZE; c++) {
                let type;
                do {
                    type = randomGemType();
                } while (wouldCreateMatch(r, c, type));
                board[r][c] = type;
            }
        }
    }

    function randomGemType() {
        return Math.floor(Math.random() * gemTypesInLevel);
    }

    // Verifica si colocar un tipo en (r,c) crearia un match
    function wouldCreateMatch(row, col, type) {
        // Check horizontal (izquierda)
        if (col >= 2 &&
            board[row][col - 1] === type &&
            board[row][col - 2] === type) {
            return true;
        }
        // Check vertical (arriba)
        if (row >= 2 &&
            board[row - 1][col] === type &&
            board[row - 2][col] === type) {
            return true;
        }
        return false;
    }

    // --- Renderizado ---

    function renderBoard() {
        gameBoard.innerHTML = '';
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const gemEl = createGemElement(board[r][c], r, c);
                gameBoard.appendChild(gemEl);
            }
        }
    }

    function createGemElement(type, row, col) {
        const gem = document.createElement('div');
        gem.className = `gem type-${type}`;
        gem.dataset.row = row;
        gem.dataset.col = col;
        gem.dataset.type = type;

        const inner = document.createElement('div');
        inner.className = 'gem-inner';
        gem.appendChild(inner);

        gem.addEventListener('click', () => onGemClick(row, col));
        return gem;
    }

    function updateGemAt(row, col) {
        const index = row * BOARD_SIZE + col;
        const existing = gameBoard.children[index];
        if (existing && board[row][col] !== null) {
            existing.className = `gem type-${board[row][col]}`;
            existing.dataset.type = board[row][col];
            existing.dataset.row = row;
            existing.dataset.col = col;

            // Re-crear el inner
            const inner = existing.querySelector('.gem-inner');
            if (inner) {
                inner.style.background = '';
            }
        }
    }

    // --- Input del Jugador ---

    function onGemClick(row, col) {
        if (isProcessing) return;
        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
        if (board[row][col] === null) return;

        clearHintTimer();

        if (selectedGem === null) {
            // Seleccionar primera gem
            selectedGem = { row, col };
            highlightSelected(row, col);
        } else if (selectedGem.row === row && selectedGem.col === col) {
            // Deseleccionar
            clearSelection();
        } else if (isAdjacent(selectedGem.row, selectedGem.col, row, col)) {
            // Intentar swap
            attemptSwap(selectedGem.row, selectedGem.col, row, col);
        } else {
            // Seleccionar nueva gem
            clearSelection();
            selectedGem = { row, col };
            highlightSelected(row, col);
        }
    }

    function highlightSelected(row, col) {
        clearSelectionHighlight();
        const index = row * BOARD_SIZE + col;
        const el = gameBoard.children[index];
        if (el) el.classList.add('selected');
    }

    function clearSelection() {
        selectedGem = null;
        clearSelectionHighlight();
    }

    function clearSelectionHighlight() {
        gameBoard.querySelectorAll('.gem.selected').forEach(g => g.classList.remove('selected'));
    }

    function clearHintHighlight() {
        gameBoard.querySelectorAll('.gem.hint').forEach(g => g.classList.remove('hint'));
    }

    function isAdjacent(r1, c1, r2, c2) {
        return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
    }

    // --- Swap ---

    async function attemptSwap(r1, c1, r2, c2) {
        isProcessing = true;
        clearSelection();

        // Animar swap visual (DOM se mueve pero board no cambia)
        await animateSwap(r1, c1, r2, c2);

        // Swap en logica
        swapGems(r1, c1, r2, c2);

        // Re-render con el estado swappeado
        renderBoard();

        // Buscar matches
        const matches = findAllMatches();

        if (matches.length === 0) {
            // Swap invalido - revertir logica y render
            swapGems(r1, c1, r2, c2);
            renderBoard();
            shakeGems(r1, c1, r2, c2);
            await delay(400);
            isProcessing = false;
            resetHintTimer();
            return;
        }

        // Movimiento valido
        movesLeft--;
        updateUI();

        // Procesar matches y cascadas
        cascadeCount = 0;
        await processMatchesAndCascades();

        // Verificar fin de juego
        checkGameStatus();

        isProcessing = false;
        resetHintTimer();
    }

    function swapGems(r1, c1, r2, c2) {
        const temp = board[r1][c1];
        board[r1][c1] = board[r2][c2];
        board[r2][c2] = temp;
    }

    async function animateSwap(r1, c1, r2, c2) {
        const index1 = r1 * BOARD_SIZE + c1;
        const index2 = r2 * BOARD_SIZE + c2;
        const el1 = gameBoard.children[index1];
        const el2 = gameBoard.children[index2];

        if (!el1 || !el2) return;

        // Calcular tamano real de celda (gem + gap)
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();
        const dx = rect2.left - rect1.left;
        const dy = rect2.top - rect1.top;

        el1.style.transition = `transform ${ANIMATION_SPEED}ms ease-in-out`;
        el2.style.transition = `transform ${ANIMATION_SPEED}ms ease-in-out`;
        el1.style.transform = `translate(${dx}px, ${dy}px)`;
        el1.style.zIndex = '5';
        el2.style.transform = `translate(${-dx}px, ${-dy}px)`;

        await delay(ANIMATION_SPEED);

        // No reseteamos transform aqui; el llamador hace renderBoard()
        // que recrea el DOM con las posiciones correctas
    }

    function shakeGems(r1, c1, r2, c2) {
        const index1 = r1 * BOARD_SIZE + c1;
        const index2 = r2 * BOARD_SIZE + c2;
        if (gameBoard.children[index1]) gameBoard.children[index1].classList.add('invalid-swap');
        if (gameBoard.children[index2]) gameBoard.children[index2].classList.add('invalid-swap');
        setTimeout(() => {
            if (gameBoard.children[index1]) gameBoard.children[index1].classList.remove('invalid-swap');
            if (gameBoard.children[index2]) gameBoard.children[index2].classList.remove('invalid-swap');
        }, 400);
    }

    // --- Deteccion de Matches ---

    function findAllMatches() {
        const matched = new Set();

        // Horizontales
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE - 2; c++) {
                const type = board[r][c];
                if (type === null) continue;
                if (board[r][c + 1] === type && board[r][c + 2] === type) {
                    let end = c + 2;
                    while (end + 1 < BOARD_SIZE && board[r][end + 1] === type) end++;
                    for (let i = c; i <= end; i++) matched.add(`${r},${i}`);
                }
            }
        }

        // Verticales
        for (let c = 0; c < BOARD_SIZE; c++) {
            for (let r = 0; r < BOARD_SIZE - 2; r++) {
                const type = board[r][c];
                if (type === null) continue;
                if (board[r + 1][c] === type && board[r + 2][c] === type) {
                    let end = r + 2;
                    while (end + 1 < BOARD_SIZE && board[end + 1][c] === type) end++;
                    for (let i = r; i <= end; i++) matched.add(`${i},${c}`);
                }
            }
        }

        // Convertir a array de { row, col }
        return Array.from(matched).map(s => {
            const [r, c] = s.split(',').map(Number);
            return { row: r, col: c };
        });
    }

    // --- Procesar Matches y Cascadas ---

    async function processMatchesAndCascades() {
        let matches = findAllMatches();

        while (matches.length > 0) {
            cascadeCount++;

            // Calcular puntos
            const points = calculateScore(matches, cascadeCount);
            score += points;
            updateUI();

            // Mostrar combo si aplica
            if (cascadeCount >= 2) {
                showCombo(cascadeCount, points);
            }

            // Mostrar particulas de puntuacion
            showScoreParticles(matches, points);

            // Animar eliminacion
            await animateMatchRemoval(matches);

            // Eliminar gems del tablero
            for (const { row, col } of matches) {
                board[row][col] = null;
            }

            // Aplicar gravedad
            await applyGravity();

            // Llenar espacios vacios
            await fillEmptySpaces();

            // Re-render
            renderBoard();

            // Esperar un poco antes de buscar nuevos matches
            await delay(CASCADE_DELAY);

            // Buscar nuevos matches
            matches = findAllMatches();
        }
    }

    function calculateScore(matches, cascade) {
        // Agrupar matches por lineas para calcular longitud
        const baseScore = matches.length * 10;

        // Bonus por match largo
        let lengthBonus = 0;
        const rows = {};
        const cols = {};
        for (const m of matches) {
            if (!rows[m.row]) rows[m.row] = [];
            rows[m.row].push(m.col);
            if (!cols[m.col]) cols[m.col] = [];
            cols[m.col].push(m.row);
        }

        for (const r in rows) {
            const sorted = rows[r].sort((a, b) => a - b);
            let consecutive = 1;
            for (let i = 1; i < sorted.length; i++) {
                if (sorted[i] === sorted[i - 1] + 1) {
                    consecutive++;
                } else {
                    lengthBonus += SCORE_MAP[Math.min(consecutive, 6)] || SCORE_MAP[6];
                    consecutive = 1;
                }
            }
            lengthBonus += SCORE_MAP[Math.min(consecutive, 6)] || SCORE_MAP[6];
        }

        for (const c in cols) {
            const sorted = cols[c].sort((a, b) => a - b);
            let consecutive = 1;
            for (let i = 1; i < sorted.length; i++) {
                if (sorted[i] === sorted[i - 1] + 1) {
                    consecutive++;
                } else {
                    lengthBonus += SCORE_MAP[Math.min(consecutive, 6)] || SCORE_MAP[6];
                    consecutive = 1;
                }
            }
            lengthBonus += SCORE_MAP[Math.min(consecutive, 6)] || SCORE_MAP[6];
        }

        // Multiplicador de cascade
        const cascadeMultiplier = cascade;
        const total = (baseScore + lengthBonus) * cascadeMultiplier;

        return Math.floor(total);
    }

    async function animateMatchRemoval(matches) {
        for (const { row, col } of matches) {
            const index = row * BOARD_SIZE + col;
            const el = gameBoard.children[index];
            if (el) el.classList.add('matched');
        }
        await delay(ANIMATION_SPEED + 100);
    }

    async function applyGravity() {
        let moved = false;
        for (let c = 0; c < BOARD_SIZE; c++) {
            let writePos = BOARD_SIZE - 1;
            for (let r = BOARD_SIZE - 1; r >= 0; r--) {
                if (board[r][c] !== null) {
                    if (r !== writePos) {
                        board[writePos][c] = board[r][c];
                        board[r][c] = null;
                        moved = true;
                    }
                    writePos--;
                }
            }
        }
        if (moved) {
            renderBoard();
            await delay(ANIMATION_SPEED);
        }
    }

    async function fillEmptySpaces() {
        let filled = false;
        for (let c = 0; c < BOARD_SIZE; c++) {
            for (let r = 0; r < BOARD_SIZE; r++) {
                if (board[r][c] === null) {
                    board[r][c] = randomGemType();
                    filled = true;
                }
            }
        }
        if (filled) {
            renderBoard();
            await delay(ANIMATION_SPEED);
        }
    }

    // --- Verificar estado del juego ---

    function checkGameStatus() {
        // Verificar si alcanzo el objetivo
        if (score >= targetScore) {
            saveHighScore();
            setTimeout(() => {
                $('#level-score').textContent = score;
                $('#level-moves').textContent = movesLeft;
                showOverlay(levelCompleteOverlay);
            }, 300);
            return;
        }

        // Verificar si se quedo sin movimientos
        if (movesLeft <= 0) {
            saveHighScore();
            setTimeout(() => {
                $('#final-score').textContent = score;
                $('#final-level').textContent = level;
                showOverlay(gameOverOverlay);
            }, 300);
            return;
        }

        // Verificar si hay movimientos validos
        if (!hasValidMoves()) {
            setTimeout(() => shuffleBoard(), 500);
        }

        saveGame();
    }

    // --- Movimientos Validos ---

    function hasValidMoves() {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                // Probar swap derecho
                if (c < BOARD_SIZE - 1) {
                    swapGems(r, c, r, c + 1);
                    const m = findAllMatches();
                    swapGems(r, c, r, c + 1);
                    if (m.length > 0) return true;
                }
                // Probar swap abajo
                if (r < BOARD_SIZE - 1) {
                    swapGems(r, c, r + 1, c);
                    const m = findAllMatches();
                    swapGems(r, c, r + 1, c);
                    if (m.length > 0) return true;
                }
            }
        }
        return false;
    }

    function findValidMove() {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (c < BOARD_SIZE - 1) {
                    swapGems(r, c, r, c + 1);
                    const m = findAllMatches();
                    swapGems(r, c, r, c + 1);
                    if (m.length > 0) return [{ row: r, col: c }, { row: r, col: c + 1 }];
                }
                if (r < BOARD_SIZE - 1) {
                    swapGems(r, c, r + 1, c);
                    const m = findAllMatches();
                    swapGems(r, c, r + 1, c);
                    if (m.length > 0) return [{ row: r, col: c }, { row: r + 1, col: c }];
                }
            }
        }
        return null;
    }

    // --- Shuffle ---

    async function shuffleBoard() {
        // Mostrar mensaje de shuffle
        showComboText('Mezclando...');

        // Re-generar tablero sin matches
        generateBoard();
        renderBoard();
        await delay(400);

        // Verificar que hay movimientos validos
        if (!hasValidMoves()) {
            await shuffleBoard();
        }
    }

    // --- Hint System ---

    function resetHintTimer() {
        clearHintTimer();
        hintTimeout = setTimeout(showHint, 5000);
    }

    function clearHintTimer() {
        if (hintTimeout) {
            clearTimeout(hintTimeout);
            hintTimeout = null;
        }
        clearHintHighlight();
    }

    function showHint() {
        if (isProcessing) return;
        const move = findValidMove();
        if (move) {
            for (const { row, col } of move) {
                const index = row * BOARD_SIZE + col;
                const el = gameBoard.children[index];
                if (el) el.classList.add('hint');
            }
        }
    }

    // --- UI Updates ---

    function updateUI() {
        $('#current-level').textContent = level;
        $('#current-score').textContent = score;
        $('#target-score').textContent = targetScore;
        $('#moves-left').textContent = movesLeft;

        // Barra de progreso
        const progress = Math.min(100, (score / targetScore) * 100);
        $('#progress-bar').style.width = `${progress}%`;

        // Cambio de color en movimientos
        const movesEl = $('#moves-left');
        if (movesLeft <= 5) {
            movesEl.style.color = '#ff4757';
        } else if (movesLeft <= 10) {
            movesEl.style.color = '#ffa502';
        } else {
            movesEl.style.color = '';
        }
    }

    function showCombo(cascade, points) {
        const name = COMBO_NAMES[Math.min(cascade, COMBO_NAMES.length - 1)] || `Combo x${cascade}!`;
        showComboText(`${name} +${points}`);
    }

    function showComboText(text) {
        comboMessage.textContent = text;
        comboMessage.classList.remove('show');
        // Forzar reflow
        void comboMessage.offsetWidth;
        comboMessage.classList.add('show');
        setTimeout(() => comboMessage.classList.remove('show'), 900);
    }

    function showScoreParticles(matches, points) {
        // Mostrar particula solo en el centro de los matches
        if (matches.length === 0) return;

        const centerMatch = matches[Math.floor(matches.length / 2)];
        const cellSize = gameBoard.children[0]?.offsetWidth + 4 || 60;
        const x = centerMatch.col * cellSize + gameBoard.offsetLeft + cellSize / 2;
        const y = centerMatch.row * cellSize + gameBoard.offsetTop + cellSize / 2;

        const particle = document.createElement('div');
        particle.className = 'score-particle';
        particle.textContent = `+${points}`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        gameBoard.parentElement.appendChild(particle);

        setTimeout(() => particle.remove(), 800);
    }

    // --- Utilidades ---

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- Iniciar ---
    document.addEventListener('DOMContentLoaded', init);

})();
