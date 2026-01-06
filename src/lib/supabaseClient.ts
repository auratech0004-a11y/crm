import { createClient } from '@supabase/supabase-js'

// Check if environment variables are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('Supabase URL is not configured. Please set VITE_SUPABASE_URL in your .env file.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  console.warn('Supabase anon key is not configured. Please set VITE_SUPABASE_ANON_KEY in your .env file.')
}

// Create a dummy client if credentials are missing
let supabase: ReturnType<typeof createClient>

if (supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://your-project.supabase.co' && 
    supabaseAnonKey !== 'your-anon-key-here') {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Create a mock client for development
  console.warn('Using mock Supabase client. Please configure Supabase credentials for full functionality.')
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
        order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) })
      }),
      insert: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
      update: () => ({ eq: () => ({ select: () => Promise.resolve({ data: [], error: null }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) })
    }),
    rpc: () => Promise.resolve({ data: null, error: null })
  } as any
}

export { supabase }