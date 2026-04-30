/* ============================================
   Auth Module - Login / Registro / Perfil
   ============================================
   Depende de: supabase-client.js (y CDN supabase.min.js)
   */

(function () {
    'use strict';

    const $ = (sel) => document.querySelector(sel);

    // --- Estado ---
    let currentSession = null;

    // --- Init ---
    async function initAuth() {
        // Escuchar cambios de auth
        onAuthStateChange(handleAuthChange);

        // Verificar sesion existente
        const session = await getSession();
        if (session) {
            currentSession = session;
            showLoggedInUI(session);
        } else {
            showLoggedOutUI();
        }
    }

    function handleAuthChange(event, session) {
        currentSession = session;
        if (session) {
            showLoggedInUI(session);
        } else {
            showLoggedOutUI();
        }
    }

    // --- UI Updates ---

    function showLoggedInUI(session) {
        const authBtn = $('#auth-btn');
        const authMenu = $('#auth-menu');
        const userMenu = $('#user-menu');
        const usernameDisplay = $('#username-display');

        if (authBtn) authBtn.style.display = 'none';
        if (authMenu) authMenu.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';

        // Cargar username
        if (session.user) {
            const email = session.user.email || '';
            const name = email.split('@')[0];
            if (usernameDisplay) {
                usernameDisplay.textContent = name.charAt(0).toUpperCase() + name.slice(1);
            }

            // Intentar cargar profile para username custom
            getProfile(session.user.id).then(profile => {
                if (profile && profile.username) {
                    if (usernameDisplay) usernameDisplay.textContent = profile.username;
                }
            });
        }
    }

    function showLoggedOutUI() {
        const authBtn = $('#auth-btn');
        const userMenu = $('#user-menu');

        if (authBtn) authBtn.style.display = '';
        if (userMenu) userMenu.style.display = 'none';
        closeAuthModal();
    }

    // --- Auth Modal ---

    function openAuthModal() {
        const modal = $('#auth-modal');
        if (modal) {
            modal.classList.add('active');
            // Focus en el primer input
            setTimeout(() => {
                const firstInput = modal.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    function closeAuthModal() {
        const modal = $('#auth-modal');
        if (modal) modal.classList.remove('active');
        clearAuthErrors();
    }

    function switchTab(tab) {
        const loginTab = $('#tab-login');
        const registerTab = $('#tab-register');
        const loginForm = $('#form-login');
        const registerForm = $('#form-register');
        const tabLoginBtn = $('#btn-tab-login');
        const tabRegisterBtn = $('#btn-tab-register');

        clearAuthErrors();

        if (tab === 'register') {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
            if (tabLoginBtn) tabLoginBtn.classList.remove('active');
            if (tabRegisterBtn) tabRegisterBtn.classList.add('active');
        } else {
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
            if (tabLoginBtn) tabLoginBtn.classList.add('active');
            if (tabRegisterBtn) tabRegisterBtn.classList.remove('active');
        }
    }

    // --- Auth Actions ---

    async function signUp(email, password, username) {
        if (!supabase) {
            showAuthError('register', 'Error de conexion. Intenta de nuevo.');
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username: username || null }
            }
        });

        if (error) {
            const msg = translateError(error.message);
            showAuthError('register', msg);
            return;
        }

        // Si requiere confirmacion de email
        if (data.user && !data.session) {
            hideAuthForms();
            const success = $('#auth-success');
            if (success) success.style.display = 'block';
            const successMsg = $('#auth-success-msg');
            if (successMsg) successMsg.textContent = 'Te enviamos un email de confirmacion. Revisa tu bandeja de entrada.';
        }
    }

    async function signIn(email, password) {
        if (!supabase) {
            showAuthError('login', 'Error de conexion. Intenta de nuevo.');
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            const msg = translateError(error.message);
            showAuthError('login', msg);
            return;
        }

        closeAuthModal();
    }

    async function signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
        showLoggedOutUI();
    }

    // --- Error Handling ---

    function showAuthError(form, message) {
        const errorEl = form === 'login'
            ? $('#login-error')
            : $('#register-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    function clearAuthErrors() {
        const errors = document.querySelectorAll('.auth-error');
        errors.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    function hideAuthForms() {
        const tabs = $('#auth-tabs');
        const loginForm = $('#form-login');
        const registerForm = $('#form-register');
        if (tabs) tabs.style.display = 'none';
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
    }

    function translateError(message) {
        const translations = {
            'Invalid login credentials': 'Email o contrasena incorrectos',
            'User already registered': 'Este email ya esta registrado',
            'Password should be at least 6 characters': 'La contrasena debe tener al menos 6 caracteres',
            'Email not confirmed': 'Tu email aun no fue confirmado',
            'Too many requests': 'Demasiados intentos. Espera un momento.',
            'Network request failed': 'Error de conexion. Verifica tu internet.',
            'Invalid email': 'Email invalido'
        };
        return translations[message] || message;
    }

    // --- Event Binding ---
    function bindEvents() {
        // Boton auth principal
        const authBtn = $('#auth-btn');
        if (authBtn) authBtn.addEventListener('click', openAuthModal);

        // Cerrar modal
        const closeBtn = $('#auth-close');
        if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);

        // Click fuera del modal para cerrar
        const modal = $('#auth-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeAuthModal();
            });
        }

        // Tabs
        const tabLogin = $('#btn-tab-login');
        const tabRegister = $('#btn-tab-register');
        if (tabLogin) tabLogin.addEventListener('click', () => switchTab('login'));
        if (tabRegister) tabRegister.addEventListener('click', () => switchTab('register'));

        // Login form
        const loginForm = $('#form-login');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = $('#login-email').value.trim();
                const password = $('#login-password').value;
                if (!email || !password) {
                    showAuthError('login', 'Completá todos los campos');
                    return;
                }
                await signIn(email, password);
            });
        }

        // Register form
        const registerForm = $('#form-register');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = $('#register-email').value.trim();
                const password = $('#register-password').value;
                const confirmPassword = $('#register-confirm').value;
                const username = $('#register-username').value.trim();

                if (!email || !password) {
                    showAuthError('register', 'Completá todos los campos obligatorios');
                    return;
                }
                if (password !== confirmPassword) {
                    showAuthError('register', 'Las contrasenas no coinciden');
                    return;
                }
                if (password.length < 6) {
                    showAuthError('register', 'La contrasena debe tener al menos 6 caracteres');
                    return;
                }

                await signUp(email, password, username || null);
            });
        }

        // Logout
        const logoutBtn = $('#logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', signOut);

        // User menu toggle (mobile)
        const userMenuBtn = $('#user-menu-btn');
        const userDropdown = $('#user-dropdown');
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
            });
            document.addEventListener('click', () => {
                userDropdown.classList.remove('active');
            });
        }
    }

    // --- Exponer para uso desde otros scripts ---
    window.Auth = {
        init: initAuth,
        getSession: getSession,
        getProfile: getProfile,
        getCurrentUser: () => currentSession?.user || null,
        signOut: signOut
    };

    // --- Init on DOM ready ---
    document.addEventListener('DOMContentLoaded', () => {
        bindEvents();
        initAuth();
    });

})();
