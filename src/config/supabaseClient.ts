
/*

To use supabase in your React components, you can import the supabase client:
import supabase from './config/supabaseClient'

Can also use console.log(supabase) to check if the client is properly initialized for a given page

*/

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;