-- FULL DATABASE SETUP QUERY
-- Run this in the Supabase SQL Editor

-- 1. Create Sewadars Table (if not exists)
create table if not exists public.sewadars (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone_number text, -- Added for phone number feature
  avatar text,       -- Added for profile pictures
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Attendance Records Table (if not exists)
create table if not exists public.attendance_records (
  id uuid default gen_random_uuid() primary key,
  sewadar_id uuid references public.sewadars(id) on delete cascade not null,
  sewadar_name text not null,
  counter text not null, -- Ensure this column exists
  date text not null,
  start_time text not null,
  end_time text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Add columns if they are missing (in case table already exists)
do $$
begin
  -- Add phone_number to sewadars if missing
  if not exists (select 1 from information_schema.columns where table_name = 'sewadars' and column_name = 'phone_number') then
    alter table public.sewadars add column phone_number text;
  end if;

  -- Add avatar to sewadars if missing
  if not exists (select 1 from information_schema.columns where table_name = 'sewadars' and column_name = 'avatar') then
    alter table public.sewadars add column avatar text;
  end if;

  -- Add counter to attendance_records if missing
  if not exists (select 1 from information_schema.columns where table_name = 'attendance_records' and column_name = 'counter') then
    alter table public.attendance_records add column counter text;
  end if;
end $$;

-- 4. Enable Row Level Security (RLS)
alter table public.sewadars enable row level security;
alter table public.attendance_records enable row level security;

-- 5. Create Policies (Drop first to avoid conflicts)
drop policy if exists "Enable read access for all users" on public.sewadars;
drop policy if exists "Enable insert access for all users" on public.sewadars;
drop policy if exists "Enable update access for all users" on public.sewadars;
drop policy if exists "Enable delete access for all users" on public.sewadars;

drop policy if exists "Enable read access for all users" on public.attendance_records;
drop policy if exists "Enable insert access for all users" on public.attendance_records;
drop policy if exists "Enable update access for all users" on public.attendance_records;
drop policy if exists "Enable delete access for all users" on public.attendance_records;

-- Re-create policies
create policy "Enable read access for all users" on public.sewadars for select using (true);
create policy "Enable insert access for all users" on public.sewadars for insert with check (true);
create policy "Enable update access for all users" on public.sewadars for update using (true);
create policy "Enable delete access for all users" on public.sewadars for delete using (true);

create policy "Enable read access for all users" on public.attendance_records for select using (true);
create policy "Enable insert access for all users" on public.attendance_records for insert with check (true);
create policy "Enable update access for all users" on public.attendance_records for update using (true);
create policy "Enable delete access for all users" on public.attendance_records for delete using (true);

-- 6. Seed Initial Data (Only if table is empty)
do $$
begin
  if not exists (select 1 from public.sewadars) then
    insert into public.sewadars (name) values 
    ('Mohinder Pal Singh Oberoi'), ('Harish Arora'), ('Rajinder Pd. Arora'), ('Vijay Pasricha'), ('H. K. Goel'), 
    ('Subhash Nangia'), ('Jai Kishan Arora'), ('Rajinder Kumar Sehgal'), ('G. L. Mukhi'), ('Bhupinder Arora'), 
    ('Deepak Goel'), ('Raj Goel'), ('Pankaj Arora'), ('Sanjeev Arora'), ('Jetender Jain'), ('Vipin Gupta'), 
    ('Bikram Singh'), ('Raj Kumar Dhall'), ('I. K. Sodhi'), ('Rajinder Gandhi'), ('R. K. Arora'), 
    ('Pooja Manocha'), ('Kanwal Malik'), ('Pooja Goel'), ('Aditi Gupta'), ('Jai Kishan Bansal'), 
    ('Devender Bhassin'), ('Nirmal Chhagani'), ('Shivani'), ('Himani Bansal'), ('S. K. Luthra'), 
    ('Gulshan Sachdeva'), ('Anita Singh'), ('Meenakshi Madan'), ('Neha Arora'), ('V. K. Talwar'), 
    ('Rakesh Gulati'), ('Neeraj Dhingra'), ('Harish Arora'), ('Ram Nanvani'), ('Raj Kumar'), 
    ('Rakesh Arora'), ('Pradeep Nagpal'), ('Vijay Arora'), ('Manish Malhotra'), ('Kavita Chitkara'), 
    ('Kuldeep Ahuja'), ('Basant Singh'), ('P. K. Sardana'), ('Anmol Bhatia'), ('Vrinda Dang'), ('Shubham Sehgal');
  end if;
end $$;
