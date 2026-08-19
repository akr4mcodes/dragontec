/**
 * DragonTec Store — Supabase Client Configuration
 * 
 * Instructions :
 * Remplacez les valeurs ci-dessous par vos identifiants Supabase trouvés dans :
 * Supabase Dashboard -> Project Settings -> API
 * 
 * IMPORTANT :
 * - N'utilisez JAMAIS votre clé 'service_role' dans ce fichier frontend.
 * - Utilisez uniquement votre clé publique 'anon' (ANON KEY).
 */

const SUPABASE_CONFIG = {
  url: 'https://ovnahzfexbybpuvtgrbr.supabase.co', // Remplacez par votre URL de projet Supabase
  anonKey: 'sb_publishable_oruLV2k1zsDP9nMDJEBC1g_Kl-oeR_p',     // Remplacez par votre clé publique 'anon'
};

// Initialisation globale du client Supabase
let supabaseClient = null;

function initSupabase() {
  try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.url.startsWith('https://') && !SUPABASE_CONFIG.url.includes('votre-projet')) {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ DragonTec: Client Supabase initialisé avec succès.');
      } else {
        console.warn('⚠️ DragonTec: Veuillez configurer SUPABASE_CONFIG dans supabase-config.js avec votre URL et clé anon Supabase.');
      }
    } else {
      console.warn('⚠️ DragonTec: Le SDK Supabase (@supabase/supabase-js) n\'est pas encore chargé.');
    }
  } catch (err) {
    console.error('❌ DragonTec: Erreur lors de l\'initialisation de Supabase:', err);
  }
  window.dragonSupabase = supabaseClient;
  return supabaseClient;
}

// Initialise immédiatement si le SDK est présent
initSupabase();

window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.getSupabaseClient = () => supabaseClient || initSupabase();
