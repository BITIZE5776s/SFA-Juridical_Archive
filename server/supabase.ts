import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lgmhziyouvylsiqvgjtd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnbWh6aXlvdXZ5bHNpcXZnanRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzE4MDUsImV4cCI6MjA2ODg0NzgwNX0.u-Mm6-ZAmmuoNAzAjjREHFgGjBAzqq7uwiD5wkiCjBo'

// Service role key for admin operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnbWh6aXlvdXZ5bHNpcXZnanRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3MTgwNSwiZXhwIjoyMDY4ODQ3ODA1fQ.jw4ucQ9KT-hY2_Gb4Z8kqVmrdP6vnj-y_eVxPQ2fBjk'

// Client for regular operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for admin operations (uses service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
