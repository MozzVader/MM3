/* ============================================
   Supabase Client - Configuracion compartida
   ============================================
   Se carga DESPUES de supabase.min.js (CDN)
   en <script> tags del HTML.
   */

const SUPABASE_URL = 'https://ixhbxiwshawebxvcrwxc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aGJ4aXdzaGF3ZWJ4dmNyd3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzM5NDYsImV4cCI6MjA5MzE0OTk0Nn0.XgojEBFNRMkJFMVV0n5_s1ltZChF65X0XHLkUeJO-rY';

const supabase = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

if (!supabase) {
    console.warn('Supabase client no disponible. Verifica que supabase.min.js esta cargado.');
}

/* --- Helpers compartidos --- */

// Obtener sesion actual
async function getSession() {
    if (!supabase) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    return error ? null : session;
}

// Obtener perfil del usuario logueado
async function getProfile(userId) {
    if (!supabase || !userId) return null;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return error ? null : data;
}

// Escuchar cambios de auth (login/logout)
function onAuthStateChange(callback) {
    if (!supabase) return;
    supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}
