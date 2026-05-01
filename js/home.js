/* ============================================
   Home Module - Landing Page Interactivity
   ============================================
   Mini Match 3 canvas auto-play
   Mini Memotest flip animation
   User stats panel with count-up
   Animated gradient border on game cards
   */

(function () {
    'use strict';

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // =============================================
    // MINI MATCH 3 - Canvas Auto-Play
    // =============================================
    const M3 = {
        canvas: null,
        ctx: null,
        cols: 4,
        rows: 4,
        cellSize: 35,
        grid: [],
        animating: false,
        hoverActive: false,
        animFrame: null,
        step: 0,
        stepTimer: null,

        // Same gem colors from CSS vars
        colors: [
            { main: '#ff4757', light: '#ff6b81', glow: 'rgba(255,71,87,0.4)' },   // red
            { main: '#3742fa', light: '#5352ed', glow: 'rgba(55,66,250,0.4)' },    // blue
            { main: '#2ed573', light: '#7bed9f', glow: 'rgba(46,213,115,0.4)' },   // green
            { main: '#ffa502', light: '#ffbe76', glow: 'rgba(255,165,2,0.4)' },    // yellow
            { main: '#a55eea', light: '#c56cf0', glow: 'rgba(165,94,234,0.4)' },   // purple
        ],

        init() {
            this.canvas = $('#match3-canvas');
            if (!this.canvas) return;

            this.canvas.width = this.cols * this.cellSize;
            this.canvas.height = this.rows * this.cellSize;
            this.ctx = this.canvas.getContext('2d');

            this.initGrid();
            this.draw();
        },

        initGrid() {
            this.grid = [];
            for (let r = 0; r < this.rows; r++) {
                this.grid[r] = [];
                for (let c = 0; c < this.cols; c++) {
                    this.grid[r][c] = {
                        type: Math.floor(Math.random() * this.colors.length),
                        scale: 1,
                        offsetX: 0,
                        offsetY: 0,
                        alpha: 1,
                        highlighted: false,
                    };
                }
            }
            // Remove initial matches
            this.removeInitialMatches();
        },

        removeInitialMatches() {
            let hasMatches = true;
            let iterations = 0;
            while (hasMatches && iterations < 100) {
                hasMatches = false;
                iterations++;
                for (let r = 0; r < this.rows; r++) {
                    for (let c = 0; c < this.cols; c++) {
                        // Check horizontal
                        if (c >= 2 &&
                            this.grid[r][c].type === this.grid[r][c - 1].type &&
                            this.grid[r][c].type === this.grid[r][c - 2].type) {
                            this.grid[r][c].type = Math.floor(Math.random() * this.colors.length);
                            hasMatches = true;
                        }
                        // Check vertical
                        if (r >= 2 &&
                            this.grid[r][c].type === this.grid[r - 1][c].type &&
                            this.grid[r][c].type === this.grid[r - 2][c].type) {
                            this.grid[r][c].type = Math.floor(Math.random() * this.colors.length);
                            hasMatches = true;
                        }
                    }
                }
            }
        },

        draw() {
            const ctx = this.ctx;
            const cs = this.cellSize;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const cell = this.grid[r][c];
                    const color = this.colors[cell.type];
                    const cx = c * cs + cs / 2 + cell.offsetX;
                    const cy = r * cs + cs / 2 + cell.offsetY;
                    const size = (cs - 6) * cell.scale;

                    ctx.save();
                    ctx.globalAlpha = cell.alpha;

                    // Glow for highlighted
                    if (cell.highlighted) {
                        ctx.shadowColor = color.glow;
                        ctx.shadowBlur = 12;
                    }

                    // Draw rounded gem
                    const radius = size * 0.22;
                    const x = cx - size / 2;
                    const y = cy - size / 2;
                    ctx.beginPath();
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + size - radius, y);
                    ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
                    ctx.lineTo(x + size, y + size - radius);
                    ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
                    ctx.lineTo(x + radius, y + size);
                    ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);
                    ctx.closePath();

                    // Gradient fill
                    const grad = ctx.createRadialGradient(
                        cx - size * 0.15, cy - size * 0.15, size * 0.1,
                        cx, cy, size * 0.6
                    );
                    grad.addColorStop(0, color.light);
                    grad.addColorStop(1, color.main);
                    ctx.fillStyle = grad;
                    ctx.fill();

                    // Shine highlight
                    ctx.beginPath();
                    ctx.ellipse(cx - size * 0.1, cy - size * 0.15, size * 0.25, size * 0.12, -0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fill();

                    ctx.restore();
                }
            }
        },

        startAutoPlay() {
            if (this.animating) return;
            this.hoverActive = true;
            this.animating = true;
            this.step = 0;
            this.runStep();
        },

        stopAutoPlay() {
            this.hoverActive = false;
            this.animating = false;
            clearTimeout(this.stepTimer);
            if (this.animFrame) cancelAnimationFrame(this.animFrame);
            // Reset grid
            this.initGrid();
            this.draw();
        },

        runStep() {
            if (!this.animating) return;
            this.stepTimer = setTimeout(() => {
                if (!this.animating) return;
                this.step = (this.step + 1) % 4;
                switch (this.step) {
                    case 0: this.doSwap(); break;
                    case 1: this.doMatch(); break;
                    case 2: this.doCollapse(); break;
                    case 3: this.doFill(); break;
                }
            }, 600);
        },

        doSwap() {
            // Find a random adjacent pair to swap
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * (this.cols - 1));
            const cell1 = this.grid[r][c];
            const cell2 = this.grid[r][c + 1];

            // Animate swap
            const duration = 300;
            const start = performance.now();

            const animate = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

                cell1.offsetX = ease * this.cellSize;
                cell2.offsetX = -ease * this.cellSize;
                this.draw();

                if (t < 1) {
                    this.animFrame = requestAnimationFrame(animate);
                } else {
                    // Actually swap
                    const temp = this.grid[r][c].type;
                    this.grid[r][c].type = this.grid[r][c + 1].type;
                    this.grid[r][c + 1].type = temp;
                    cell1.offsetX = 0;
                    cell2.offsetX = 0;
                    this.draw();
                    this.runStep();
                }
            };
            this.animFrame = requestAnimationFrame(animate);
        },

        doMatch() {
            // Find any match and highlight it
            let found = false;
            for (let r = 0; r < this.rows && !found; r++) {
                for (let c = 0; c < this.cols - 2 && !found; c++) {
                    if (this.grid[r][c].type === this.grid[r][c + 1].type &&
                        this.grid[r][c].type === this.grid[r][c + 2].type) {
                        this.grid[r][c].highlighted = true;
                        this.grid[r][c + 1].highlighted = true;
                        this.grid[r][c + 2].highlighted = true;
                        found = true;
                    }
                }
            }
            if (!found) {
                for (let r = 0; r < this.rows - 2 && !found; r++) {
                    for (let c = 0; c < this.cols && !found; c++) {
                        if (this.grid[r][c].type === this.grid[r + 1][c].type &&
                            this.grid[r][c].type === this.grid[r + 2][c].type) {
                            this.grid[r][c].highlighted = true;
                            this.grid[r + 1][c].highlighted = true;
                            this.grid[r + 2][c].highlighted = true;
                            found = true;
                        }
                    }
                }
            }

            this.draw();
            this.runStep();
        },

        doCollapse() {
            // Fade out highlighted gems
            const duration = 300;
            const start = performance.now();

            const animate = (now) => {
                const t = Math.min((now - start) / duration, 1);
                for (let r = 0; r < this.rows; r++) {
                    for (let c = 0; c < this.cols; c++) {
                        if (this.grid[r][c].highlighted) {
                            this.grid[r][c].scale = 1 - t;
                            this.grid[r][c].alpha = 1 - t;
                        }
                    }
                }
                this.draw();

                if (t < 1) {
                    this.animFrame = requestAnimationFrame(animate);
                } else {
                    // Clear highlighted cells
                    for (let r = 0; r < this.rows; r++) {
                        for (let c = 0; c < this.cols; c++) {
                            if (this.grid[r][c].highlighted) {
                                this.grid[r][c].type = -1; // empty
                                this.grid[r][c].highlighted = false;
                                this.grid[r][c].scale = 1;
                                this.grid[r][c].alpha = 1;
                            }
                        }
                    }
                    this.draw();
                    this.runStep();
                }
            };
            this.animFrame = requestAnimationFrame(animate);
        },

        doFill() {
            // Fill empty cells from top
            for (let c = 0; c < this.cols; c++) {
                let emptyRow = this.rows - 1;
                for (let r = this.rows - 1; r >= 0; r--) {
                    if (this.grid[r][c].type !== -1) {
                        if (r !== emptyRow) {
                            this.grid[emptyRow][c].type = this.grid[r][c].type;
                            this.grid[r][c].type = -1;
                        }
                        emptyRow--;
                    }
                }
                // Fill top with new gems
                for (let r = emptyRow; r >= 0; r--) {
                    this.grid[r][c].type = Math.floor(Math.random() * this.colors.length);
                }
            }

            this.draw();
            this.runStep();
        },
    };

    // =============================================
    // MINI MEMOTEST - Flip Animation
    // =============================================
    const MT = {
        cards: [],
        animating: false,
        hoverActive: false,
        stepTimer: null,

        init() {
            const board = $('#mini-memotest-board');
            if (!board) return;
            this.cards = Array.from(board.querySelectorAll('.mini-memotest-card'));
        },

        startAutoPlay() {
            if (this.animating) return;
            this.hoverActive = true;
            this.animating = true;
            this.resetCards();
            this.runSequence();
        },

        stopAutoPlay() {
            this.hoverActive = false;
            this.animating = false;
            clearTimeout(this.stepTimer);
            this.resetCards();
        },

        resetCards() {
            this.cards.forEach(card => {
                card.classList.remove('flipped', 'matched');
            });
        },

        runSequence() {
            if (!this.animating) return;
            this.resetCards();

            // Step 1: Flip first pair
            this.stepTimer = setTimeout(() => {
                if (!this.animating) return;
                this.cards[0].classList.add('flipped');
                this.cards[2].classList.add('flipped'); // pair 0

                // Step 2: Flip second pair
                this.stepTimer = setTimeout(() => {
                    if (!this.animating) return;
                    this.cards[1].classList.add('flipped');
                    this.cards[3].classList.add('flipped'); // pair 1

                    // Step 3: Mark as matched
                    this.stepTimer = setTimeout(() => {
                        if (!this.animating) return;
                        this.cards.forEach(c => {
                            c.classList.add('matched');
                        });

                        // Step 4: Pause and restart
                        this.stepTimer = setTimeout(() => {
                            if (!this.animating) return;
                            this.runSequence();
                        }, 1200);
                    }, 500);
                }, 600);
            }, 400);
        },
    };

    // =============================================
    // ANIMATED GRADIENT BORDER
    // =============================================
    function initGlowBorders() {
        // Use @property for CSS custom property animation
        if (CSS.registerProperty) {
            try {
                CSS.registerProperty({
                    name: '--glow-angle',
                    syntax: '<angle>',
                    initialValue: '0deg',
                    inherits: false,
                });
            } catch (e) { /* already registered or not supported */ }
        }

        // Fallback: JS-driven rotation for browsers without @property
        if (!CSS.registerProperty) {
            const borders = $$('.card-glow-border');
            let start = null;

            function rotateBorder(timestamp) {
                if (!start) start = timestamp;
                const elapsed = timestamp - start;
                const angle = (elapsed / 3000) * 360; // 3s per rotation

                borders.forEach(b => {
                    if (b.parentElement.matches('.game-card:hover')) {
                        b.style.background = `conic-gradient(
                            from ${angle}deg,
                            transparent 0%,
                            #ff6b35 10%,
                            #a55eea 20%,
                            #3742fa 30%,
                            transparent 40%
                        )`;
                        b.style.opacity = '0.6';
                    } else {
                        b.style.opacity = '0';
                    }
                });

                requestAnimationFrame(rotateBorder);
            }
            requestAnimationFrame(rotateBorder);
        }
    }

    // =============================================
    // COUNT-UP ANIMATION
    // =============================================
    function countUp(element, target, duration = 800, suffix = '') {
        const start = performance.now();
        const startValue = 0;

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (target - startValue) * eased);

            if (suffix === 's') {
                // Time format: show as seconds
                element.textContent = current > 0 ? formatTime(current) : '--';
            } else {
                element.textContent = current.toLocaleString('es-AR') + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function formatTime(totalSeconds) {
        if (totalSeconds < 60) return totalSeconds + 's';
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // =============================================
    // USER STATS
    // =============================================
    const Stats = {
        cached: null,

        async load() {
            if (!sb) return null;

            // Check cache
            const cached = sessionStorage.getItem('miniarcade_stats');
            if (cached) {
                try {
                    this.cached = JSON.parse(cached);
                    return this.cached;
                } catch (e) { /* ignore */ }
            }

            const user = Auth.getCurrentUser();
            if (!user) return null;

            try {
                // Fetch all scores for this user
                const { data, error } = await sb
                    .from('game_scores')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const stats = this.processScores(data || []);

                // Fetch username
                const profile = await Auth.getProfile(user.id);
                if (profile && profile.username) {
                    stats.username = profile.username;
                } else if (user.email) {
                    stats.username = user.email.split('@')[0];
                    stats.username = stats.username.charAt(0).toUpperCase() + stats.username.slice(1);
                }

                // Cache for 5 minutes
                this.cached = stats;
                sessionStorage.setItem('miniarcade_stats', JSON.stringify(stats));
                sessionStorage.setItem('miniarcade_stats_time', Date.now().toString());

                return stats;
            } catch (e) {
                console.warn('Error loading stats:', e);
                return null;
            }
        },

        processScores(scores) {
            const match3Scores = scores.filter(s => s.game_slug === 'match3');
            const memotestScores = scores.filter(s => s.game_slug === 'memotest');

            let bestMatch3 = 0;
            let bestMemotest = null;
            let totalScore = 0;
            const topScores = [];

            match3Scores.forEach(s => {
                totalScore += s.score;
                if (s.score > bestMatch3) bestMatch3 = s.score;
            });

            memotestScores.forEach(s => {
                totalScore += s.score;
                // For memotest, lower time = better. Store in metadata.
                const time = s.metadata?.time || s.score;
                if (!bestMemotest || time < bestMemotest) {
                    bestMemotest = time;
                }
            });

            // Collect top 3 overall scores for "Best Moments"
            const allWithMeta = scores.map(s => ({
                game: s.game_slug,
                score: s.score,
                level: s.level,
                metadata: s.metadata,
                date: s.created_at,
            }));
            allWithMeta.sort((a, b) => b.score - a.score);
            topScores.push(...allWithMeta.slice(0, 3));

            return {
                totalGames: scores.length,
                totalScore,
                bestMatch3,
                bestMemotest: bestMemotest ? Math.round(bestMemotest) : null,
                topScores,
                match3Count: match3Scores.length,
                memotestCount: memotestScores.length,
            };
        },

        clearCache() {
            sessionStorage.removeItem('miniarcade_stats');
            sessionStorage.removeItem('miniarcade_stats_time');
            this.cached = null;
        },
    };

    // =============================================
    // UI UPDATES
    // =============================================
    function showStatsPanel(stats) {
        const statsSection = $('#user-stats-section');
        const guestSection = $('#guest-cta-section');

        if (!stats || stats.totalGames === 0) {
            // Logged in but no games yet
            statsSection.style.display = 'none';
            if (guestSection) {
                guestSection.style.display = 'block';
                const text = guestSection.querySelector('.guest-cta-text');
                if (text) {
                    text.innerHTML = `
                        <strong>Tu perfil esta listo</strong>
                        <span>Juega tu primera partida para ver tus estadisticas aqui.</span>
                    `;
                }
                const btn = $('#guest-login-btn');
                if (btn) btn.style.display = 'none';
                const icon = guestSection.querySelector('.guest-cta-icon');
                if (icon) icon.innerHTML = '&#x1F3AF;';
            }
            return;
        }

        if (guestSection) guestSection.style.display = 'none';
        if (statsSection) statsSection.style.display = 'block';

        // Update username
        const nameEl = $('#stats-username');
        if (nameEl && stats.username) {
            nameEl.textContent = stats.username;
        }

        // Animate stats
        const totalGamesEl = document.querySelector('[data-stat="totalGames"]');
        const totalScoreEl = document.querySelector('[data-stat="totalScore"]');
        const bestMatch3El = document.querySelector('[data-stat="bestMatch3"]');
        const bestMemotestEl = document.querySelector('[data-stat="bestMemotest"]');

        if (totalGamesEl) countUp(totalGamesEl, stats.totalGames, 600);
        if (totalScoreEl) countUp(totalScoreEl, stats.totalScore, 1000);
        if (bestMatch3El) countUp(bestMatch3El, stats.bestMatch3, 800);
        if (bestMemotestEl) {
            if (stats.bestMemotest) {
                countUp(bestMemotestEl, stats.bestMemotest, 800, 's');
            } else {
                bestMemotestEl.textContent = '--';
            }
        }

        // Best moments
        const momentsSection = $('#best-moments');
        const momentsList = $('#moments-list');
        if (momentsSection && momentsList && stats.topScores.length > 0) {
            momentsSection.style.display = 'block';
            momentsList.innerHTML = stats.topScores.map(s => {
                const gameName = s.game === 'match3' ? 'Match 3' : 'Memotest';
                const gameIcon = s.game === 'match3' ? '&#x1F48E;' : '&#x1F0CF;';
                const scoreDisplay = s.game === 'memotest' && s.metadata?.time
                    ? `${formatTime(Math.round(s.metadata.time))}`
                    : s.score.toLocaleString('es-AR');
                const metaParts = [];
                if (s.level) metaParts.push(`Nivel ${s.level}`);
                if (s.date) {
                    const d = new Date(s.date);
                    metaParts.push(d.toLocaleDateString('es-AR'));
                }

                return `
                    <div class="moment-card">
                        <div class="moment-game">${gameIcon} ${gameName}</div>
                        <div class="moment-score">${scoreDisplay}</div>
                        <div class="moment-meta">${metaParts.join(' &middot; ')}</div>
                    </div>
                `;
            }).join('');
        }
    }

    function showGuestCTA() {
        const statsSection = $('#user-stats-section');
        const guestSection = $('#guest-cta-section');
        if (statsSection) statsSection.style.display = 'none';
        if (guestSection) {
            guestSection.style.display = 'block';
            const btn = $('#guest-login-btn');
            if (btn) btn.style.display = '';
            const text = guestSection.querySelector('.guest-cta-text');
            if (text) {
                text.innerHTML = `
                    <strong>Inicia sesion para ver tus estadisticas</strong>
                    <span>Lleva el registro de tus partidas, compite en rankings y desbloquea logros.</span>
                `;
            }
            const icon = guestSection.querySelector('.guest-cta-icon');
            if (icon) icon.innerHTML = '&#x1F3B5;';
        }
    }

    function hideAllPanels() {
        const statsSection = $('#user-stats-section');
        const guestSection = $('#guest-cta-section');
        if (statsSection) statsSection.style.display = 'none';
        if (guestSection) guestSection.style.display = 'none';
    }

    // =============================================
    // CARD HOVER LISTENERS
    // =============================================
    function initCardHovers() {
        const match3Card = document.querySelector('.game-card[data-game="match3"]');
        const memotestCard = document.querySelector('.game-card[data-game="memotest"]');

        if (match3Card) {
            match3Card.addEventListener('mouseenter', () => M3.startAutoPlay());
            match3Card.addEventListener('mouseleave', () => M3.stopAutoPlay());
            // Touch support
            match3Card.addEventListener('touchstart', () => M3.startAutoPlay(), { passive: true });
            match3Card.addEventListener('touchend', () => {
                setTimeout(() => M3.stopAutoPlay(), 2000);
            }, { passive: true });
        }

        if (memotestCard) {
            memotestCard.addEventListener('mouseenter', () => MT.startAutoPlay());
            memotestCard.addEventListener('mouseleave', () => MT.stopAutoPlay());
            memotestCard.addEventListener('touchstart', () => MT.startAutoPlay(), { passive: true });
            memotestCard.addEventListener('touchend', () => {
                setTimeout(() => MT.stopAutoPlay(), 2000);
            }, { passive: true });
        }
    }

    // =============================================
    // INIT
    // =============================================
    async function init() {
        // Wait for DOM
        await new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });

        // Initialize mini demos
        M3.init();
        MT.init();

        // Initialize animated borders
        initGlowBorders();

        // Card hover listeners
        initCardHovers();

        // Smooth scroll for CTA
        const ctaBtn = $('.hero-cta');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', function (e) {
                e.preventDefault();
                document.getElementById('games').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Intersection Observer for game cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, i * 150);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        $$('.game-card').forEach(card => observer.observe(card));

        // Guest CTA login button
        const guestLoginBtn = $('#guest-login-btn');
        if (guestLoginBtn) {
            guestLoginBtn.addEventListener('click', () => {
                const authBtn = $('#auth-btn');
                if (authBtn) authBtn.click();
            });
        }

        // Load stats based on auth state
        await loadStatsForUser();

        // Listen for auth changes
        if (sb) {
            onAuthStateChange(async (event, session) => {
                Stats.clearCache();
                await loadStatsForUser();
            });
        }
    }

    async function loadStatsForUser() {
        const user = Auth.getCurrentUser();
        if (user) {
            const stats = await Stats.load();
            showStatsPanel(stats);
        } else {
            // Wait a moment to check if auth has initialized
            setTimeout(async () => {
                const session = await Auth.getSession();
                if (session) {
                    const stats = await Stats.load();
                    showStatsPanel(stats);
                } else {
                    showGuestCTA();
                }
            }, 500);
        }
    }

    // Start
    init();

})();
