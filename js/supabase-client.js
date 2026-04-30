/* ============================================
   Supabase Client - Configuracion compartida
   ============================================
   Se carga DESPUES de supabase.min.js (CDN)
   en <script> tags del HTML.
   */

const SUPABASE_URL = 'https://ixhbxiwshawebxvcrwxc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aGJ4aXdzaGF3ZWJ4dmNyd3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzM5NDYsImV4cCI6MjA5MzE0OTk0Nn0.XgojEBFNRMkJFMVV0n5_s1ltZChF65X0XHLkUeJO-rY';

// El CDN expone window.supabase con .createClient()
// Usamos sb como nombre para evitar conflicto
const sb = (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

if (!sb) {
    console.warn('Supabase client no disponible. Verifica que supabase.min.js esta cargado.');
}

/* --- Helpers compartidos --- */

// Obtener sesion actual
async function getSession() {
    if (!sb) return null;
    const { data: { session }, error } = await sb.auth.getSession();
    return error ? null : session;
}

// Obtener perfil del usuario logueado
async function getProfile(userId) {
    if (!sb || !userId) return null;
    const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return error ? null : data;
}

// Escuchar cambios de auth (login/logout)
function onAuthStateChange(callback) {
    if (!sb) return;
    sb.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}
