-- 1. Create an enum for roles
create type public.app_role as enum ('admin', 'staff', 'user');

-- 2. Create user_roles table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone not null default now(),
    unique (user_id, role)
);

-- 3. Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- 4. Create RLS policy for user_roles (users can only see their own roles)
create policy "Users can view their own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

-- 5. Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 6. Add status column to trial_class_registrations for tracking
alter table public.trial_class_registrations
add column status text not null default 'Pendiente',
add column notes text;

-- 7. Drop the old blocking SELECT policy
drop policy if exists "No public reads on trial class registrations" on public.trial_class_registrations;

-- 8. Create new SELECT policy that allows admins and staff
create policy "Admins and staff can view trial class registrations"
on public.trial_class_registrations
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin') or 
  public.has_role(auth.uid(), 'staff')
);

-- 9. Create UPDATE policy for admins and staff
create policy "Admins and staff can update trial class registrations"
on public.trial_class_registrations
for update
to authenticated
using (
  public.has_role(auth.uid(), 'admin') or 
  public.has_role(auth.uid(), 'staff')
)
with check (
  public.has_role(auth.uid(), 'admin') or 
  public.has_role(auth.uid(), 'staff')
);

-- 10. Create DELETE policy for admins only
create policy "Admins can delete trial class registrations"
on public.trial_class_registrations
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));