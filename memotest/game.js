/* ============================================
   Memotest - Motor del Juego
   ============================================ */

(function () {
    'use strict';

    // --- 16 Cartas default (color + icono) ---
    const DEFAULT_CARDS = [
        { color: '#FF4757', icon: 'fa-heart' },        // Rojo
        { color: '#FF6348', icon: 'fa-fire' },          // Naranja rojo
        { color: '#FFA502', icon: 'fa-sun' },           // Naranja
        { color: '#FECA57', icon: 'fa-star' },          // Amarillo
        { color: '#2ED573', icon: 'fa-leaf' },          // Verde claro
        { color: '#1ABC9C', icon: 'fa-tree' },          // Verde azulado
        { color: '#00D2D3', icon: 'fa-snowflake' },     // Cian
        { color: '#3742FA', icon: 'fa-bolt' },          // Azul
        { color: '#5352ED', icon: 'fa-moon' },          // Violeta azul
        { color: '#A55EEA', icon: 'fa-gem' },           // Violeta
        { color: '#D980FA', icon: 'fa-magic' },         // Lila
        { color: '#FF6B81', icon: 'fa-music' },         // Rosa
        { color: '#F8A5C2', icon: 'fa-feather' },       // Rosa claro
        { color: '#778CA3', icon: 'fa-anchor' },        // Gris azulado
        { color: '#DFE6E9', icon: 'fa-cloud' },         // Blanco gris
        { color: '#2C3A47', icon: 'fa-skull' },         // Oscuro
    ];

    // --- Configuraciones de dificultad ---
    const DIFFICULTIES = {
        easy:   { cols: 4, rows: 3, pairs: 6,  name: 'FACIL',   parScore: 3 },
        normal: { cols: 4, rows: 4, pairs: 8,  name: 'NORMAL',  parScore: 3 },
        hard:   { cols: 5, rows: 4, pairs: 10, name: 'DIFICIL', parScore: 4 },
        expert: { cols: 6, rows: 4, pairs: 12, name: 'EXPERTO', parScore: 5 },
    };

    // --- Estado del juego ---
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let moves = 0;
    let isProcessing = false;
    let timer = null;
    let seconds = 0;
    let gameStarted = false;
    let currentDifficulty = 'easy';

    // --- Referencias DOM ---
    const $ = (sel) => document.querySelector(sel);
    const startScreen = $('#start-screen');
    const gameScreen = $('#game-screen');
    const gameBoard = $('#game-board');
    const winOverlay = $('#win-overlay');

    // --- Inicializacion ---
    function init() {
        bindEvents();
        loadHighScore();
    }

    function bindEvents() {
        $('#btn-new-game').addEventListener('click', startGame);
        $('#btn-play-again').addEventListener('click', startGame);
        $('#btn-back-menu').addEventListener('click', backToMenu);

        // Difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDifficulty = btn.dataset.diff;
                loadHighScore();
            });
        });
    }

    // --- Persistencia ---
    function loadHighScore() {
        const key = `memotest_hs_${currentDifficulty}`;
        const hs = localStorage.getItem(key);
        $('#high-score-value').textContent = hs || '--';
    }

    function saveHighScore(score) {
        const key = `memotest_hs_${currentDifficulty}`;
        const current = parseInt(localStorage.getItem(key) || '0');
        if (score > current) {
            localStorage.setItem(key, score.toString());
        }
    }

    // --- Navegacion ---
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

    // --- Iniciar Juego ---
    function startGame() {
        const diff = DIFFICULTIES[currentDifficulty];
        totalPairs = diff.pairs;
        matchedPairs = 0;
        moves = 0;
        seconds = 0;
        gameStarted = false;
        flippedCards = [];
        isProcessing = false;

        if (timer) clearInterval(timer);
        timer = null;

        // Actualizar UI
        $('#moves-count').textContent = '0';
        $('#pairs-found').textContent = `0/${totalPairs}`;
        $('#timer-display').textContent = '0:00';
        $('#diff-badge').textContent = diff.name;

        showScreen(gameScreen);
        hideOverlay(winOverlay);

        // Generar y renderizar tablero
        generateBoard(diff);
        renderBoard(diff);
    }

    function backToMenu() {
        if (timer) clearInterval(timer);
        hideOverlay(winOverlay);
        loadHighScore();
        showScreen(startScreen);
    }

    // --- Generar Tablero ---
    function generateBoard(diff) {
        // Seleccionar cartas al azar de las 16 default
        const shuffledDefaults = [...DEFAULT_CARDS].sort(() => Math.random() - 0.5);
        const selectedCards = shuffledDefaults.slice(0, diff.pairs);

        // Crear pares y mezclar
        cards = [];
        for (const card of selectedCards) {
            cards.push({ ...card, id: cards.length, matched: false });
            cards.push({ ...card, id: cards.length + 1, matched: false });
        }
        cards = shuffle(cards);
    }

    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        // Reasignar IDs despues de mezclar
        return arr.map((card, i) => ({ ...card, id: i }));
    }

    // --- Renderizado ---
    function renderBoard(diff) {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${diff.cols}, 1fr)`;
        gameBoard.style.maxWidth = `${diff.cols * 90 + (diff.cols - 1) * 8 + 24}px`;

        for (const card of cards) {
            const cardEl = createCardElement(card);
            gameBoard.appendChild(cardEl);
        }
    }

    function createCardElement(card) {
        const el = document.createElement('div');
        el.className = 'memo-card';
        el.dataset.id = card.id;
        el.dataset.cardIndex = card.id;

        // Cara trasera (lo que se ve al principio)
        const back = document.createElement('div');
        back.className = 'card-face card-back';
        back.innerHTML = '<i class="fa-solid fa-question"></i>';

        // Cara frontal (icono + color)
        const front = document.createElement('div');
        front.className = 'card-face card-front';
        front.style.backgroundColor = card.color;
        front.innerHTML = `<i class="fa-solid ${card.icon}"></i>`;

        el.appendChild(back);
        el.appendChild(front);

        // Click handler
        el.addEventListener('click', () => onCardClick(card.id, el));

        return el;
    }

    // --- Logica del Juego ---
    function onCardClick(cardId, el) {
        if (isProcessing) return;
        if (el.classList.contains('flipped') || el.classList.contains('matched')) return;
        if (flippedCards.length >= 2) return;

        // Iniciar timer en el primer click
        if (!gameStarted) {
            gameStarted = true;
            startTimer();
        }

        // Voltear carta
        el.classList.add('flipped');
        flippedCards.push({ id: cardId, el });

        // Si ya hay 2 cartas volteadas, verificar match
        if (flippedCards.length === 2) {
            moves++;
            $('#moves-count').textContent = moves;

            const [first, second] = flippedCards;
            const firstCard = cards[first.id];
            const secondCard = cards[second.id];

            if (firstCard.color === secondCard.color && firstCard.icon === secondCard.icon) {
                // Match!
                isProcessing = true;
                setTimeout(() => {
                    first.el.classList.add('matched');
                    second.el.classList.add('matched');
                    matchedPairs++;
                    $('#pairs-found').textContent = `${matchedPairs}/${totalPairs}`;
                    flippedCards = [];
                    isProcessing = false;

                    // Verificar victoria
                    if (matchedPairs === totalPairs) {
                        onWin();
                    }
                }, 300);
            } else {
                // No match
                isProcessing = true;
                setTimeout(() => {
                    first.el.classList.remove('flipped');
                    second.el.classList.remove('flipped');
                    flippedCards = [];
                    isProcessing = false;
                }, 800);
            }
        }
    }

    // --- Timer ---
    function startTimer() {
        timer = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            $('#timer-display').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function formatTime(totalSeconds) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // --- Victoria ---
    function onWin() {
        stopTimer();

        const diff = DIFFICULTIES[currentDifficulty];
        const score = calculateScore();
        const stars = calculateStars();

        // Guardar high score
        saveHighScore(score);

        // Mostrar overlay con delay para que se vea la ultima carta
        setTimeout(() => {
            $('#final-moves').textContent = moves;
            $('#final-time').textContent = formatTime(seconds);
            $('#final-score').textContent = score;
            renderStars(stars);
            showOverlay(winOverlay);
        }, 600);
    }

    function calculateScore() {
        // Base: puntos por par encontrado
        const baseScore = totalPairs * 100;

        // Bonus por eficiencia (menos movimientos = mejor)
        const minMoves = totalPairs; // Perfecto seria 1 move por par
        const moveRatio = minMoves / moves;
        const moveBonus = Math.floor(baseScore * moveRatio);

        // Bonus por velocidad
        const diff = DIFFICULTIES[currentDifficulty];
        const timeLimit = diff.parScore * 30; // Tiempo esperado en segundos
        const timeRatio = Math.max(0, 1 - (seconds / (timeLimit * 2)));
        const timeBonus = Math.floor(baseScore * timeRatio);

        // Bonus por dificultad
        const diffMultiplier = { easy: 1, normal: 1.5, hard: 2, expert: 2.5 };
        const multiplier = diffMultiplier[currentDifficulty] || 1;

        return Math.floor((baseScore + moveBonus + timeBonus) * multiplier);
    }

    function calculateStars() {
        const minMoves = totalPairs;
        const ratio = moves / minMoves;

        if (ratio <= 1.3) return 3;  // Excelente
        if (ratio <= 1.8) return 2;  // Bueno
        if (ratio <= 2.5) return 1;  // Aceptable
        return 0; // Necesita practica
    }

    function renderStars(count) {
        const container = $('#stars-display');
        container.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('span');
            star.className = `result-star ${i < count ? 'star-earned' : 'star-empty'}`;
            star.innerHTML = '<i class="fa-solid fa-star"></i>';
            container.appendChild(star);
        }
    }

    // --- Init ---
    document.addEventListener('DOMContentLoaded', init);

})();
