/* ============================================
   Memotest - Motor del Juego + Pack Manager
   ============================================ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════
    // ICONS CATALOG (para el picker)
    // ═══════════════════════════════════════════
    const ICONS_CATALOG = [
        'fa-heart', 'fa-star', 'fa-fire', 'fa-bolt', 'fa-gem', 'fa-crown',
        'fa-wand-magic-sparkles', 'fa-skull', 'fa-ghost', 'fa-dragon',
        'fa-dog', 'fa-cat', 'fa-fish', 'fa-dove', 'fa-horse', 'fa-spider',
        'fa-frog', 'fa-crow', 'fa-otter', 'fa-hippo', 'fa-worm', 'fa-shrimp',
        'fa-leaf', 'fa-tree', 'fa-snowflake', 'fa-sun', 'fa-moon', 'fa-cloud',
        'fa-cloud-bolt', 'fa-water', 'fa-mountain-sun', 'fa-fire-flame-curved',
        'fa-apple-whole', 'fa-lemon', 'fa-pizza-slice', 'fa-ice-cream',
        'fa-cookie', 'fa-mug-hot', 'fa-wine-glass', 'fa-beer-mug-empty',
        'fa-cake-candles', 'fa-candy-cane',
        'fa-music', 'fa-guitar', 'fa-palette', 'fa-paintbrush',
        'fa-masks-theater', 'fa-camera', 'fa-film', 'fa-headphones',
        'fa-microphone', 'fa-drum',
        'fa-futbol', 'fa-basketball', 'fa-football', 'fa-baseball',
        'fa-table-tennis-paddle-ball', 'fa-bowling-ball', 'fa-golf-ball-tee',
        'fa-volleyball',
        'fa-car', 'fa-plane', 'fa-ship', 'fa-bicycle', 'fa-motorcycle',
        'fa-rocket', 'fa-helicopter', 'fa-truck',
        'fa-anchor', 'fa-feather', 'fa-key', 'fa-bell', 'fa-gift', 'fa-bomb',
        'fa-dice', 'fa-infinity', 'fa-shield', 'fa-yin-yang', 'fa-compass',
        'fa-flask', 'fa-gears', 'fa-puzzle-piece', 'fa-trophy', 'fa-medal',
        'fa-bullseye',
    ];

    const QUICK_COLORS = [
        '#FF4757', '#FF6348', '#FFA502', '#FECA57',
        '#2ED573', '#1ABC9C', '#00D2D3', '#3742FA',
        '#5352ED', '#A55EEA', '#D980FA', '#FF6B81',
        '#F8A5C2', '#778CA3', '#2C3A47', '#DFE6E9',
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9',
        '#BAE1FF', '#D0BAFF', '#E8D5B7', '#B5EAD7',
    ];

    // ═══════════════════════════════════════════
    // OFFICIAL PACKS
    // ═══════════════════════════════════════════
    const OFFICIAL_PACKS = {
        default: {
            name: 'Clasico',
            cards: [
                { color: '#FF4757', icon: 'fa-heart' },
                { color: '#FF6348', icon: 'fa-fire' },
                { color: '#FFA502', icon: 'fa-sun' },
                { color: '#FECA57', icon: 'fa-star' },
                { color: '#2ED573', icon: 'fa-leaf' },
                { color: '#1ABC9C', icon: 'fa-tree' },
                { color: '#00D2D3', icon: 'fa-snowflake' },
                { color: '#3742FA', icon: 'fa-bolt' },
                { color: '#5352ED', icon: 'fa-moon' },
                { color: '#A55EEA', icon: 'fa-gem' },
                { color: '#D980FA', icon: 'fa-wand-magic-sparkles' },
                { color: '#FF6B81', icon: 'fa-music' },
                { color: '#F8A5C2', icon: 'fa-feather' },
                { color: '#778CA3', icon: 'fa-anchor' },
                { color: '#DFE6E9', icon: 'fa-cloud' },
                { color: '#2C3A47', icon: 'fa-skull' },
            ]
        },
        pastel: {
            name: 'Pastel',
            cards: [
                { color: '#FFB3BA', icon: 'fa-heart' },
                { color: '#FFDFBA', icon: 'fa-fire' },
                { color: '#FFFFBA', icon: 'fa-sun' },
                { color: '#E8FFB3', icon: 'fa-star' },
                { color: '#BAFFC9', icon: 'fa-leaf' },
                { color: '#B3F5E0', icon: 'fa-tree' },
                { color: '#BAE1FF', icon: 'fa-snowflake' },
                { color: '#B3D4FF', icon: 'fa-bolt' },
                { color: '#D0BAFF', icon: 'fa-moon' },
                { color: '#E0B3FF', icon: 'fa-gem' },
                { color: '#FFB3DE', icon: 'fa-wand-magic-sparkles' },
                { color: '#FFB3F0', icon: 'fa-music' },
                { color: '#FFDAB3', icon: 'fa-feather' },
                { color: '#C9D6FF', icon: 'fa-anchor' },
                { color: '#FFF0B3', icon: 'fa-crown' },
                { color: '#D4E7FF', icon: 'fa-cloud' },
            ]
        }
    };

    // ═══════════════════════════════════════════
    // DIFFICULTY CONFIGS
    // ═══════════════════════════════════════════
    const DIFFICULTIES = {
        easy:   { cols: 4, rows: 3, pairs: 6,  name: 'FACIL',   parScore: 3 },
        normal: { cols: 4, rows: 4, pairs: 8,  name: 'NORMAL',  parScore: 3 },
        hard:   { cols: 5, rows: 4, pairs: 10, name: 'DIFICIL', parScore: 4 },
        expert: { cols: 6, rows: 4, pairs: 12, name: 'EXPERTO', parScore: 5 },
    };

    // ═══════════════════════════════════════════
    // LOCALSTORAGE KEYS
    // ═══════════════════════════════════════════
    const LS = {
        PACKS:  'memotest_custom_packs',
        ACTIVE: 'memotest_active_pack',
        HS:     'memotest_hs_',
    };

    // ═══════════════════════════════════════════
    // GAME STATE
    // ═══════════════════════════════════════════
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
    let activePackId = 'default';

    // Pack editor state
    let editingPackId = null;     // null = new, string = existing custom pack ID
    let editingSlots = [];        // 16 slots temporales
    let editingSlotIndex = -1;    // slot siendo editado en detalle
    let currentSlotType = 'icon'; // 'icon' o 'image'
    let editingSlotData = {};     // datos temporales del slot

    // ═══════════════════════════════════════════
    // DOM HELPERS
    // ═══════════════════════════════════════════
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ═══════════════════════════════════════════
    // PACK MANAGEMENT (localStorage)
    // ═══════════════════════════════════════════
    function getCustomPacks() {
        try {
            return JSON.parse(localStorage.getItem(LS.PACKS)) || {};
        } catch { return {}; }
    }

    function saveCustomPacks(packs) {
        localStorage.setItem(LS.PACKS, JSON.stringify(packs));
    }

    function getActivePackId() {
        return localStorage.getItem(LS.ACTIVE) || 'default';
    }

    function saveActivePackId(id) {
        activePackId = id;
        localStorage.setItem(LS.ACTIVE, id);
        updatePackBadge();
    }

    function getPackById(id) {
        if (OFFICIAL_PACKS[id]) return { id, ...OFFICIAL_PACKS[id], official: true };
        const packs = getCustomPacks();
        if (packs[id]) return { id, ...packs[id], official: false };
        return null;
    }

    function getActivePack() {
        const pack = getPackById(activePackId);
        return pack || { id: 'default', ...OFFICIAL_PACKS.default, official: true };
    }

    function getActiveCards() {
        const pack = getActivePack();
        return pack.cards || [];
    }

    // ═══════════════════════════════════════════
    // CARD IDENTIFIER (para matching)
    // ═══════════════════════════════════════════
    function getMatchId(card) {
        if (card.image) return 'img_' + card.image;
        return (card.color || '') + '_' + (card.icon || '');
    }

    // ═══════════════════════════════════════════
    // PACK BADGE (en start screen)
    // ═══════════════════════════════════════════
    function updatePackBadge() {
        const pack = getActivePack();
        const badge = $('#active-pack-name');
        if (badge) badge.textContent = pack.name;
    }

    // ═══════════════════════════════════════════
    // PACK MODAL - VIEW MANAGEMENT
    // ═══════════════════════════════════════════
    function showPackModal() {
        renderPackSelection();
        showView('pack-selection');
        $('#pack-modal').classList.add('active');
    }

    function hidePackModal() {
        $('#pack-modal').classList.remove('active');
    }

    function showView(viewId) {
        ['pack-selection', 'slot-editor', 'slot-edit-form', 'import-form'].forEach(v => {
            const el = $('#' + v);
            if (el) el.style.display = v === viewId ? '' : 'none';
        });
    }

    // ═══════════════════════════════════════════
    // RENDER PACK SELECTION
    // ═══════════════════════════════════════════
    function renderPackSelection() {
        renderOfficialPacks();
        renderCustomPacks();
    }

    function renderOfficialPacks() {
        const container = $('#official-packs');
        container.innerHTML = '';
        for (const [id, pack] of Object.entries(OFFICIAL_PACKS)) {
            container.appendChild(createPackCard(id, pack, true));
        }
    }

    function renderCustomPacks() {
        const container = $('#custom-packs');
        const empty = $('#no-custom-packs');
        const packs = getCustomPacks();
        const keys = Object.keys(packs);
        container.innerHTML = '';

        if (keys.length === 0) {
            empty.style.display = '';
        } else {
            empty.style.display = 'none';
            for (const id of keys) {
                container.appendChild(createPackCard(id, packs[id], false));
            }
        }
    }

    function createPackCard(id, pack, isOfficial) {
        const el = document.createElement('div');
        el.className = 'pack-card' + (id === activePackId ? ' active' : '') + (isOfficial ? ' official' : ' custom');

        // Mini preview (primeras 4 cartas)
        const preview = document.createElement('div');
        preview.className = 'pack-preview';
        const previewCards = (pack.cards || []).slice(0, 4);
        previewCards.forEach(card => {
            const mini = document.createElement('div');
            mini.className = 'pack-mini-card';
            if (card.image) {
                mini.style.backgroundImage = `url(${card.image})`;
                mini.style.backgroundSize = 'cover';
                mini.style.backgroundPosition = 'center';
            } else {
                mini.style.backgroundColor = card.color;
                mini.innerHTML = `<i class="fa-solid ${card.icon}"></i>`;
            }
            preview.appendChild(mini);
        });
        el.appendChild(preview);

        // Info
        const info = document.createElement('div');
        info.className = 'pack-info';
        const name = document.createElement('span');
        name.className = 'pack-name';
        name.textContent = pack.name;
        info.appendChild(name);

        if (id === activePackId) {
            const check = document.createElement('span');
            check.className = 'pack-active-badge';
            check.innerHTML = '<i class="fa-solid fa-check"></i> Activo';
            info.appendChild(check);
        }

        el.appendChild(info);

        // Actions
        if (!isOfficial) {
            const actions = document.createElement('div');
            actions.className = 'pack-actions-row';

            const btnEdit = document.createElement('button');
            btnEdit.className = 'pack-action-btn';
            btnEdit.innerHTML = '<i class="fa-solid fa-pen"></i>';
            btnEdit.title = 'Editar';
            btnEdit.addEventListener('click', (e) => { e.stopPropagation(); openSlotEditor(id); });

            const btnExport = document.createElement('button');
            btnExport.className = 'pack-action-btn';
            btnExport.innerHTML = '<i class="fa-solid fa-share-from-square"></i>';
            btnExport.title = 'Exportar';
            btnExport.addEventListener('click', (e) => { e.stopPropagation(); doExport(id); });

            const btnDuplicate = document.createElement('button');
            btnDuplicate.className = 'pack-action-btn';
            btnDuplicate.innerHTML = '<i class="fa-solid fa-copy"></i>';
            btnDuplicate.title = 'Duplicar';
            btnDuplicate.addEventListener('click', (e) => { e.stopPropagation(); duplicatePack(id); });

            const btnDelete = document.createElement('button');
            btnDelete.className = 'pack-action-btn danger';
            btnDelete.innerHTML = '<i class="fa-solid fa-trash"></i>';
            btnDelete.title = 'Eliminar';
            btnDelete.addEventListener('click', (e) => { e.stopPropagation(); deletePack(id); });

            actions.appendChild(btnEdit);
            actions.appendChild(btnExport);
            actions.appendChild(btnDuplicate);
            actions.appendChild(btnDelete);
            el.appendChild(actions);
        }

        // Click to select
        el.addEventListener('click', () => {
            saveActivePackId(id);
            renderPackSelection();
        });

        return el;
    }

    // ═══════════════════════════════════════════
    // SLOT EDITOR (16 slots)
    // ═══════════════════════════════════════════
    function openSlotEditor(packId) {
        editingPackId = packId;

        if (packId) {
            // Editar existente
            const pack = getPackById(packId);
            editingSlots = JSON.parse(JSON.stringify(pack.cards));
            $('#editor-title').textContent = 'Editar Pack';
            $('#pack-name-input').value = pack.name;
            $('#pack-name-input').readOnly = true;
            $('#btn-export-pack').style.display = '';
        } else {
            // Nuevo pack
            editingSlots = Array.from({ length: 16 }, () => ({ color: '', icon: '', image: '' }));
            $('#editor-title').textContent = 'Nuevo Pack';
            $('#pack-name-input').value = '';
            $('#pack-name-input').readOnly = false;
            $('#btn-export-pack').style.display = 'none';
        }

        renderEditorGrid();
        showView('slot-editor');
    }

    function renderEditorGrid() {
        const grid = $('#editor-grid');
        grid.innerHTML = '';
        editingSlots.forEach((slot, i) => {
            const el = document.createElement('div');
            el.className = 'editor-slot';
            if (slot.image) {
                el.style.backgroundImage = `url(${slot.image})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.classList.add('has-image');
            } else if (slot.color && slot.icon) {
                el.style.backgroundColor = slot.color;
                el.innerHTML = `<i class="fa-solid ${slot.icon}"></i>`;
            } else {
                el.classList.add('empty');
                el.innerHTML = '<i class="fa-solid fa-plus"></i>';
            }

            // Numero de slot
            const num = document.createElement('span');
            num.className = 'slot-number';
            num.textContent = i + 1;
            el.appendChild(num);

            el.addEventListener('click', () => openSlotEdit(i));
            grid.appendChild(el);
        });
    }

    function savePack() {
        const name = $('#pack-name-input').value.trim();
        if (!name) {
            alert('Ponele un nombre al pack');
            return;
        }

        // Validar que al menos 2 slots esten completos
        const filledSlots = editingSlots.filter(s => (s.color && s.icon) || s.image);
        if (filledSlots.length < 2) {
            alert('Complete al menos 2 cartas');
            return;
        }

        if (editingPackId) {
            // Actualizar existente
            const packs = getCustomPacks();
            packs[editingPackId].cards = editingSlots;
            saveCustomPacks(packs);
        } else {
            // Crear nuevo
            const id = 'pack_' + Date.now();
            const packs = getCustomPacks();
            packs[id] = { name, cards: editingSlots };
            saveCustomPacks(packs);
            saveActivePackId(id);
        }

        hidePackModal();
    }

    // ═══════════════════════════════════════════
    // SINGLE SLOT EDITOR
    // ═══════════════════════════════════════════
    function openSlotEdit(index) {
        editingSlotIndex = index;
        const slot = editingSlots[index];
        editingSlotData = JSON.parse(JSON.stringify(slot));

        // Determinar tipo
        currentSlotType = slot.image ? 'image' : 'icon';

        // Actualizar tabs
        $$('.slot-type-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.type === currentSlotType);
        });

        // Actualizar campos icon
        if (editingSlotData.color) {
            $('#slot-color').value = editingSlotData.color;
        }
        $('#slot-image-url').value = editingSlotData.image || '';

        renderQuickColors();
        renderIconPicker();
        updateSlotPreview();
        showView('slot-edit-form');
    }

    function renderQuickColors() {
        const container = $('#quick-colors');
        container.innerHTML = '';
        QUICK_COLORS.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch' + (editingSlotData.color === color ? ' selected' : '');
            swatch.style.backgroundColor = color;
            swatch.addEventListener('click', () => {
                editingSlotData.color = color;
                $('#slot-color').value = color;
                updateQuickColorSelection();
                updateSlotPreview();
            });
            container.appendChild(swatch);
        });
    }

    function updateQuickColorSelection() {
        $$('.color-swatch').forEach(s => {
            s.classList.toggle('selected',
                s.style.backgroundColor === convertToRgb(editingSlotData.color));
        });
    }

    function convertToRgb(hex) {
        // Convert hex to rgb for comparison
        if (!hex) return '';
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function renderIconPicker() {
        const container = $('#icon-grid');
        container.innerHTML = '';
        ICONS_CATALOG.forEach(icon => {
            const el = document.createElement('div');
            el.className = 'icon-option' + (editingSlotData.icon === icon ? ' selected' : '');
            el.innerHTML = `<i class="fa-solid ${icon}"></i>`;
            el.addEventListener('click', () => {
                editingSlotData.icon = icon;
                $$('.icon-option').forEach(o => o.classList.remove('selected'));
                el.classList.add('selected');
                updateSlotPreview();
            });
            container.appendChild(el);
        });
    }

    function updateSlotPreview() {
        const preview = $('#slot-preview-card');
        preview.innerHTML = '';
        preview.style.backgroundColor = '';
        preview.style.backgroundImage = '';

        if (currentSlotType === 'image' && editingSlotData.image) {
            preview.style.backgroundImage = `url(${editingSlotData.image})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
        } else if (editingSlotData.color) {
            preview.style.backgroundColor = editingSlotData.color;
            if (editingSlotData.icon) {
                preview.innerHTML = `<i class="fa-solid ${editingSlotData.icon}"></i>`;
            }
        }
    }

    function saveSlot() {
        if (currentSlotType === 'image') {
            const url = $('#slot-image-url').value.trim();
            editingSlots[editingSlotIndex] = { color: '', icon: '', image: url };
        } else {
            editingSlots[editingSlotIndex] = {
                color: editingSlotData.color || '',
                icon: editingSlotData.icon || '',
                image: '',
            };
        }
        renderEditorGrid();
        showView('slot-editor');
    }

    // ═══════════════════════════════════════════
    // CRUD PACKS
    // ═══════════════════════════════════════════
    function deletePack(id) {
        const pack = getPackById(id);
        if (!pack) return;
        if (!confirm(`Eliminar "${pack.name}"?`)) return;

        const packs = getCustomPacks();
        delete packs[id];
        saveCustomPacks(packs);

        if (activePackId === id) {
            saveActivePackId('default');
        }

        renderCustomPacks();
    }

    function duplicatePack(id) {
        const pack = getPackById(id);
        if (!pack) return;

        const newId = 'pack_' + Date.now();
        const packs = getCustomPacks();
        packs[newId] = {
            name: pack.name + ' (copia)',
            cards: JSON.parse(JSON.stringify(pack.cards)),
        };
        saveCustomPacks(packs);
        renderCustomPacks();
    }

    // ═══════════════════════════════════════════
    // EXPORT / IMPORT
    // ═══════════════════════════════════════════
    function doExport(packId) {
        const pack = getPackById(packId);
        if (!pack) return;
        try {
            const json = JSON.stringify({ name: pack.name, cards: pack.cards });
            const base64 = btoa(unescape(encodeURIComponent(json)));

            // Mostrar en textarea para copiar
            showView('import-form');
            $('#import-title').textContent = 'Exportar Pack';
            $('#import-textarea').value = base64;
            $('#import-textarea').readOnly = true;
            $('#btn-do-import').style.display = 'none';
            $('#btn-copy-export').style.display = '';

            // Auto-seleccionar
            setTimeout(() => {
                $('#import-textarea').select();
            }, 100);
        } catch (e) {
            alert('Error al exportar');
        }
    }

    function doImport() {
        const base64 = $('#import-textarea').value.trim();
        if (!base64) {
            alert('Pega el codigo del pack');
            return;
        }
        try {
            const json = decodeURIComponent(escape(atob(base64)));
            const data = JSON.parse(json);

            if (!data.name || !Array.isArray(data.cards)) {
                throw new Error('Formato invalido');
            }
            if (data.cards.length !== 16) {
                throw new Error('El pack debe tener exactamente 16 cartas');
            }

            // Validar cada carta
            for (const card of data.cards) {
                const hasImage = card.image && card.image.trim();
                const hasIcon = card.color && card.icon;
                if (!hasImage && !hasIcon) {
                    throw new Error('Cada carta debe tener color+icono o una imagen');
                }
            }

            const id = 'pack_' + Date.now();
            const packs = getCustomPacks();
            // Evitar nombre duplicado
            let name = data.name;
            let counter = 1;
            while (Object.values(packs).some(p => p.name === name)) {
                name = data.name + ' (' + counter + ')';
                counter++;
            }
            packs[id] = { name, cards: data.cards };
            saveCustomPacks(packs);
            saveActivePackId(id);
            hidePackModal();
        } catch (e) {
            alert('Error: ' + e.message);
        }
    }

    function showImportForm() {
        showView('import-form');
        $('#import-title').textContent = 'Importar Pack';
        $('#import-textarea').value = '';
        $('#import-textarea').readOnly = false;
        $('#btn-do-import').style.display = '';
        $('#btn-copy-export').style.display = 'none';
    }

    // ═══════════════════════════════════════════
    // TEMPLATE PNG
    // ═══════════════════════════════════════════
    function downloadTemplate() {
        const canvas = document.createElement('canvas');
        const w = 400, h = 600;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // Fondo blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        // Borde delgado
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        // Zona interior punteada
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.strokeRect(24, 24, w - 48, h - 48);
        ctx.setLineDash([]);

        // Marcos esquina naranja
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 3;
        const m = 8, l = 30;
        // Arriba-izq
        ctx.beginPath(); ctx.moveTo(m, m + l); ctx.lineTo(m, m); ctx.lineTo(m + l, m); ctx.stroke();
        // Arriba-der
        ctx.beginPath(); ctx.moveTo(w - m - l, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + l); ctx.stroke();
        // Abajo-izq
        ctx.beginPath(); ctx.moveTo(m, h - m - l); ctx.lineTo(m, h - m); ctx.lineTo(m + l, h - m); ctx.stroke();
        // Abajo-der
        ctx.beginPath(); ctx.moveTo(w - m - l, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - l); ctx.stroke();

        // Cruz central guia
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(w / 2, 40); ctx.lineTo(w / 2, h - 40); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(40, h / 2); ctx.lineTo(w - 40, h / 2); ctx.stroke();

        // Texto guia
        ctx.fillStyle = '#aaaaaa';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Tu imagen aqui', w / 2, h / 2 - 16);
        ctx.font = '15px sans-serif';
        ctx.fillText('400 x 600 px', w / 2, h / 2 + 16);
        ctx.font = '12px sans-serif';
        ctx.fillText('Ratio 2:3', w / 2, h / 2 + 40);

        // Descargar
        const link = document.createElement('a');
        link.download = 'memotest-card-template.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // ═══════════════════════════════════════════
    // HIGH SCORE (localStorage)
    // ═══════════════════════════════════════════
    function loadHighScore() {
        const key = LS.HS + currentDifficulty;
        const hs = localStorage.getItem(key);
        $('#high-score-value').textContent = hs || '--';
    }

    function saveHighScore(score) {
        const key = LS.HS + currentDifficulty;
        const current = parseInt(localStorage.getItem(key) || '0');
        if (score > current) {
            localStorage.setItem(key, score.toString());
        }
    }

    // ═══════════════════════════════════════════
    // SAVE SCORE TO SUPABASE
    // ═══════════════════════════════════════════
    async function saveScoreToSupabase(score) {
        try {
            if (typeof sb === 'undefined' || !sb) return;
            const { data: { session } } = await sb.auth.getSession();
            if (!session?.user) return; // not logged in, skip silently

            await sb.from('game_scores').insert({
                user_id: session.user.id,
                game_slug: 'memotest',
                score: score,
                level: currentDifficulty,
                metadata: {
                    time: seconds,
                    moves: moves,
                    pairs: totalPairs,
                    stars: calculateStars(),
                    pack: activePackId,
                },
            });
            console.log('[memotest] Score saved to Supabase');
        } catch (e) {
            console.warn('[memotest] Error saving score:', e);
        }
    }

    // ═══════════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════════
    function showScreen(screen) {
        $$('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function showOverlay(overlay) {
        overlay.classList.add('active');
    }

    function hideOverlay(overlay) {
        overlay.classList.remove('active');
    }

    // ═══════════════════════════════════════════
    // START GAME
    // ═══════════════════════════════════════════
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

        $('#moves-count').textContent = '0';
        $('#pairs-found').textContent = `0/${totalPairs}`;
        $('#timer-display').textContent = '0:00';
        $('#diff-badge').textContent = diff.name;

        showScreen($('#game-screen'));
        hideOverlay($('#win-overlay'));

        generateBoard(diff);
        renderBoard(diff);
    }

    function backToMenu() {
        if (timer) clearInterval(timer);
        hideOverlay($('#win-overlay'));
        loadHighScore();
        showScreen($('#start-screen'));
    }

    // ═══════════════════════════════════════════
    // BOARD GENERATION
    // ═══════════════════════════════════════════
    function generateBoard(diff) {
        const allCards = getActiveCards();

        // Solo cartas completas (con icono+color o image)
        const validCards = allCards.filter(c => (c.color && c.icon) || c.image);
        if (validCards.length < diff.pairs) {
            // Fallback al default
            const fallback = OFFICIAL_PACKS.default.cards.filter(c => c.color && c.icon);
            validCards.length = 0;
            fallback.forEach(c => validCards.push(c));
        }

        // Mezclar y seleccionar
        const shuffled = [...validCards].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, diff.pairs);

        // Crear pares
        cards = [];
        for (const card of selected) {
            const c = { ...card };
            const d = { ...card };
            cards.push(c, d);
        }
        cards = shuffle(cards);
    }

    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.map((card, i) => ({ ...card, _id: i }));
    }

    // ═══════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════
    function renderBoard(diff) {
        const board = $('#game-board');
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${diff.cols}, 1fr)`;
        board.style.maxWidth = `${diff.cols * 90 + (diff.cols - 1) * 8 + 24}px`;

        for (const card of cards) {
            board.appendChild(createCardElement(card));
        }
    }

    function createCardElement(card) {
        const el = document.createElement('div');
        el.className = 'memo-card';
        el.dataset.cardId = card._id;

        // Back
        const back = document.createElement('div');
        back.className = 'card-face card-back';
        back.innerHTML = '<i class="fa-solid fa-question"></i>';

        // Front
        const front = document.createElement('div');
        front.className = 'card-face card-front';

        if (card.image) {
            front.style.backgroundColor = '#333';
            front.style.padding = '0';
            front.style.overflow = 'hidden';
            const img = document.createElement('img');
            img.src = card.image;
            img.alt = '';
            img.loading = 'lazy';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:9px;';
            img.onerror = function () {
                this.parentElement.style.backgroundColor = '#444';
                this.parentElement.innerHTML = '<i class="fa-solid fa-image" style="opacity:0.3;font-size:1.2rem;"></i>';
            };
            front.appendChild(img);
        } else {
            front.style.backgroundColor = card.color;
            front.innerHTML = `<i class="fa-solid ${card.icon}"></i>`;
        }

        el.appendChild(back);
        el.appendChild(front);
        el.addEventListener('click', () => onCardClick(card._id, el));

        return el;
    }

    // ═══════════════════════════════════════════
    // GAME LOGIC
    // ═══════════════════════════════════════════
    function onCardClick(cardId, el) {
        if (isProcessing) return;
        if (el.classList.contains('flipped') || el.classList.contains('matched')) return;
        if (flippedCards.length >= 2) return;

        if (!gameStarted) {
            gameStarted = true;
            startTimer();
        }

        el.classList.add('flipped');
        flippedCards.push({ id: cardId, el });

        if (flippedCards.length === 2) {
            moves++;
            $('#moves-count').textContent = moves;

            const [first, second] = flippedCards;
            const c1 = cards[first.id];
            const c2 = cards[second.id];

            if (getMatchId(c1) === getMatchId(c2)) {
                // Match!
                isProcessing = true;
                setTimeout(() => {
                    first.el.classList.add('matched');
                    second.el.classList.add('matched');
                    matchedPairs++;
                    $('#pairs-found').textContent = `${matchedPairs}/${totalPairs}`;
                    flippedCards = [];
                    isProcessing = false;

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

    // ═══════════════════════════════════════════
    // TIMER
    // ═══════════════════════════════════════════
    function startTimer() {
        timer = setInterval(() => {
            seconds++;
            $('#timer-display').textContent = formatTime(seconds);
        }, 1000);
    }

    function stopTimer() {
        if (timer) { clearInterval(timer); timer = null; }
    }

    function formatTime(s) {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ═══════════════════════════════════════════
    // WIN
    // ═══════════════════════════════════════════
    function onWin() {
        stopTimer();
        const score = calculateScore();
        const stars = calculateStars();
        saveHighScore(score);
        saveScoreToSupabase(score); // Save to Supabase (async, non-blocking)

        setTimeout(() => {
            $('#final-moves').textContent = moves;
            $('#final-time').textContent = formatTime(seconds);
            $('#final-score').textContent = score;
            renderStars(stars);
            showOverlay($('#win-overlay'));
        }, 600);
    }

    function calculateScore() {
        const baseScore = totalPairs * 100;
        const minMoves = totalPairs;
        const moveRatio = minMoves / moves;
        const moveBonus = Math.floor(baseScore * moveRatio);
        const diff = DIFFICULTIES[currentDifficulty];
        const timeLimit = diff.parScore * 30;
        const timeRatio = Math.max(0, 1 - (seconds / (timeLimit * 2)));
        const timeBonus = Math.floor(baseScore * timeRatio);
        const multipliers = { easy: 1, normal: 1.5, hard: 2, expert: 2.5 };
        const multiplier = multipliers[currentDifficulty] || 1;
        return Math.floor((baseScore + moveBonus + timeBonus) * multiplier);
    }

    function calculateStars() {
        const minMoves = totalPairs;
        const ratio = moves / minMoves;
        if (ratio <= 1.3) return 3;
        if (ratio <= 1.8) return 2;
        if (ratio <= 2.5) return 1;
        return 0;
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

    // ═══════════════════════════════════════════
    // EVENT BINDING
    // ═══════════════════════════════════════════
    function bindEvents() {
        // Game controls
        $('#btn-new-game').addEventListener('click', startGame);
        $('#btn-play-again').addEventListener('click', startGame);
        $('#btn-back-menu').addEventListener('click', backToMenu);

        // Difficulty buttons
        $$('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDifficulty = btn.dataset.diff;
                loadHighScore();
            });
        });

        // Pack modal
        $('#btn-select-pack').addEventListener('click', showPackModal);
        $('#pack-modal-close').addEventListener('click', hidePackModal);

        // Pack modal: create new
        $('#btn-create-pack').addEventListener('click', () => openSlotEditor(null));

        // Slot editor: back / save
        $('#btn-editor-back').addEventListener('click', () => {
            renderPackSelection();
            showView('pack-selection');
        });
        $('#btn-save-pack').addEventListener('click', savePack);

        // Slot detail: back / save
        $('#btn-slot-back').addEventListener('click', () => {
            renderEditorGrid();
            showView('slot-editor');
        });
        $('#btn-save-slot').addEventListener('click', saveSlot);

        // Slot type tabs
        $$('.slot-type-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                currentSlotType = tab.dataset.type;
                $$('.slot-type-tab').forEach(t => t.classList.toggle('active', t === tab));
                $('#slot-icon-type').style.display = currentSlotType === 'icon' ? '' : 'none';
                $('#slot-image-type').style.display = currentSlotType === 'image' ? '' : 'none';
                updateSlotPreview();
            });
        });

        // Color picker
        $('#slot-color').addEventListener('input', (e) => {
            editingSlotData.color = e.target.value;
            updateQuickColorSelection();
            updateSlotPreview();
        });

        // Image URL
        $('#slot-image-url').addEventListener('input', (e) => {
            editingSlotData.image = e.target.value;
            updateSlotPreview();
        });

        // Export pack from editor
        $('#btn-export-pack').addEventListener('click', () => {
            if (editingPackId) doExport(editingPackId);
        });

        // Import form
        $('#btn-import-pack').addEventListener('click', showImportForm);
        $('#btn-import-back').addEventListener('click', () => {
            renderPackSelection();
            showView('pack-selection');
        });
        $('#btn-do-import').addEventListener('click', doImport);

        // Copy export
        $('#btn-copy-export').addEventListener('click', () => {
            const ta = $('#import-textarea');
            ta.select();
            navigator.clipboard.writeText(ta.value).then(() => {
                $('#btn-copy-export').innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
                setTimeout(() => {
                    $('#btn-copy-export').innerHTML = '<i class="fa-solid fa-copy"></i> Copiar';
                }, 2000);
            });
        });

        // Template
        $('#btn-download-template').addEventListener('click', downloadTemplate);
    }

    // ═══════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════
    function init() {
        activePackId = getActivePackId();
        updatePackBadge();
        bindEvents();
        loadHighScore();
    }

    document.addEventListener('DOMContentLoaded', init);

})();
