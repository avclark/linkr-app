import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  } else {
    console.warn('⚠️ Supabase environment variables not found. Using fallback values for development.')
  }
}

// Use environment variables or fallback to your current values for development
export const supabase = createClient(
  supabaseUrl || 'https://ktalzotacycmybxuvwrk.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWx6b3RhY3ljbXlieHV2d3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjg0NzMsImV4cCI6MjA3MDcwNDQ3M30.pRPAlcMtPJYWvJXQoX68v6_dRwsBz1c6qx7cYBtNack'
)

export type LinkEntry = {
  id: string
  name: string
  url: string
  created_at: string
}

export type CreateLinkEntry = {
  name: string
  url: string
}
