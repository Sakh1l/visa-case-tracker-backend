-- SQL function to safely delete all cases
-- This will be called via Supabase RPC
create or replace function delete_all_cases()
returns void as $$
begin
  -- First delete any rows with invalid UUIDs
  delete from cases where id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
  
  -- Then delete remaining rows
  delete from cases;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users (adjust role as needed)
grant execute on function delete_all_cases() to authenticated;

-- Alternative: If you prefer to use a stored procedure instead of a function
-- create or replace procedure delete_all_cases()
-- language sql
-- as $$
--   delete from cases;
-- $$;
-- grant execute on procedure delete_all_cases() to authenticated;
