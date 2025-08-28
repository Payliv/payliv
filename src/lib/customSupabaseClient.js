import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uxvbhmnemnzixlnvawgm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4dmJobW5lbW56aXhsbnZhd2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU1NjIsImV4cCI6MjA2ODAwMTU2Mn0.MJKG95PctLTsr0EdTW7C4fWJcZEBdYQo4O5CUF56uBE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);