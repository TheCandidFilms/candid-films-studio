import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pvilihkscngtccpaabes.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aWxpaGtzY25ndGNjcGFhYmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MzA3NzgsImV4cCI6MjA5ODQwNjc3OH0.BlJNv-COlW-ycJnDWH_SDUqWF9XTICsQe5XzitEayQQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
