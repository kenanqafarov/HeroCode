// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ipdwmraaasikvmhkuhmr.supabase.co'
const supabaseAnonKey = 'sb_publishable___OK4Rye3X6rK1GwEoPQ4Q_pciloO2w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);