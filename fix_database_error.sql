-- Copy and run this SQL in your Supabase SQL Editor to fix the "missing column" error

-- 1. Add the missing 'counter' column to the attendance_records table
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS counter text;

-- 2. Add the 'phone_number' column to sewadars table (for the new phone number feature)
ALTER TABLE sewadars ADD COLUMN IF NOT EXISTS phone_number text;

-- 3. Refresh the schema cache (Supabase usually does this automatically, but good to know)
NOTIFY pgrst, 'reload schema';
