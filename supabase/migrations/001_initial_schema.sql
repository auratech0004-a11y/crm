-- Create employees table
create table if not exists employees (
  id uuid default gen_random_uuid() primary key,
  employee_id text unique,
  name text not null,
  username text unique not null,
  role text not null check (role in ('ADMIN', 'EMPLOYEE', 'LEAD')),
  salary numeric default 0,
  designation text,
  joining_date date,
  status text default 'active',
  allowed_modules text[] default array[]::text[],
  profile_pic text,
  phone text,
  email text unique,
  address text,
  lead_id uuid references employees(id),
  created_at timestamp with time zone default now()
);

-- Create attendance table
create table if not exists attendance (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id) not null,
  date date not null,
  check_in time,
  check_out time,
  status text check (status in ('Present', 'Absent', 'Late')) default 'Present',
  method text check (method in ('Auto', 'Manual')) default 'Manual',
  location jsonb,
  created_at timestamp with time zone default now(),
  unique(employee_id, date)
);

-- Create fines table
create table if not exists fines (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id) not null,
  amount numeric not null,
  reason text not null,
  date date not null,
  status text check (status in ('Paid', 'Unpaid')) default 'Unpaid',
  created_at timestamp with time zone default now()
);

-- Create leaves table
create table if not exists leaves (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id) not null,
  employee_name text not null,
  type text not null,
  start_date date not null,
  end_date date not null,
  reason text not null,
  status text check (status in ('Pending', 'Approved', 'Rejected')) default 'Pending',
  request_date date default current_date,
  created_at timestamp with time zone default now()
);

-- Create appeals table
create table if not exists appeals (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id) not null,
  employee_name text not null,
  type text check (type in ('Absent', 'Late', 'Fine', 'Salary', 'Other')) not null,
  reason text not null,
  message text not null,
  status text check (status in ('Pending', 'Approved', 'Rejected')) default 'Pending',
  date date not null,
  appeal_date date default current_date,
  related_id text,
  created_at timestamp with time zone default now()
);

-- Create settings table
create table if not exists settings (
  id text primary key default 'settings',
  office_start_time time default '09:00:00',
  office_end_time time default '18:00:00',
  late_fine_amount numeric default 100,
  half_day_hours numeric default 4,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create audit_logs table
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  details text,
  user text not null,
  timestamp timestamp with time zone default now()
);

-- Create payroll_status table
create table if not exists payroll_status (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id) not null,
  status text check (status in ('Paid', 'Pending')) default 'Pending',
  month integer not null,
  year integer not null,
  base_salary numeric default 0,
  deductions numeric default 0,
  net_salary numeric default 0,
  created_at timestamp with time zone default now(),
  unique(employee_id, month, year)
);

-- Insert default admin user
insert into employees (id, employee_id, name, username, role, salary, designation, joining_date, email)
values (
  '00000000-0000-0000-0000-000000000001',
  'ADMIN-001',
  'A.R HR Admin',
  'admin',
  'ADMIN',
  0,
  'Super Admin',
  '2023-01-01',
  'admin@arhr.com'
) on conflict (username) do nothing;

-- Insert sample employees
insert into employees (employee_id, name, username, role, salary, designation, joining_date, email)
values 
  ('EMP-001', 'Babar Azam', 'babar', 'EMPLOYEE', 45000, 'Graphic Designer', '2024-01-15', 'babar@arhr.com'),
  ('EMP-002', 'Sara Ahmed', 'sara', 'EMPLOYEE', 55000, 'UI/UX Designer', '2024-02-01', 'sara@arhr.com')
on conflict (username) do nothing;

-- Insert default settings
insert into settings (id)
values ('settings')
on conflict (id) do nothing;

-- Enable Row Level Security (RLS)
alter table employees enable row level security;
alter table attendance enable row level security;
alter table fines enable row level security;
alter table leaves enable row level security;
alter table appeals enable row level security;
alter table settings enable row level security;
alter table audit_logs enable row level security;
alter table payroll_status enable row level security;

-- Create policies for employees
create policy "Employees can view their own data" on employees
  for select using (id = auth.uid() or role = 'ADMIN');

create policy "Admins can manage employees" on employees
  for all using (role = 'ADMIN');

-- Create policies for attendance
create policy "Employees can view their own attendance" on attendance
  for select using (employee_id = auth.uid());

create policy "Admins can manage attendance" on attendance
  for all using (exists (select 1 from employees where id = auth.uid() and role = 'ADMIN'));

-- Create policies for fines
create policy "Employees can view their own fines" on fines
  for select using (employee_id = auth.uid());

create policy "Admins can manage fines" on fines
  for all using (exists (select 1 from employees where id = auth.uid() and role = 'ADMIN'));

-- Create policies for leaves
create policy "Employees can view their own leaves" on leaves
  for select using (employee_id = auth.uid());

create policy "Admins can manage leaves" on leaves
  for all using (exists (select 1 from employees where id = auth.uid() and role = 'ADMIN'));

-- Create policies for appeals
create policy "Employees can view their own appeals" on appeals
  for select using (employee_id = auth.uid());

create policy "Admins can manage appeals" on appeals
  for all using (exists (select 1 from employees where id = auth.uid() and role = 'ADMIN'));

-- Create policies for settings
create policy "Everyone can view settings" on settings
  for select using (true);

create policy "Admins can manage settings" on settings
  for all using (exists (select 1 from employees where id = auth.uid() and role = 'ADMIN'));

-- Create policies for payroll_status
create policy "Employees can view their own payroll status" on payroll_status
  for select using (employee_id = auth.uid());

create policy "Admins can manage payroll status" on payroll_status
  for all using (exists (select 1 from employees where id = auth.uid() and role = 'ADMIN'));

-- Create function to get dashboard stats
create or replace function get_dashboard_stats()
returns json
language plpgsql
as $$
declare
  total_employees integer;
  present_today integer;
  absent_today integer;
  pending_leaves integer;
  on_leave integer;
  total_fines numeric;
  monthly_payroll numeric;
begin
  select count(*) into total_employees from employees where role = 'EMPLOYEE';
  
  select count(*) into present_today from attendance 
  where date = current_date and status in ('Present', 'Late');
  
  absent_today := total_employees - present_today;
  
  select count(*) into pending_leaves from leaves where status = 'Pending';
  
  select count(*) into on_leave from leaves 
  where status = 'Approved' 
  and current_date between start_date and end_date;
  
  select coalesce(sum(amount), 0) into total_fines from fines where status = 'Unpaid';
  
  select coalesce(sum(salary), 0) into monthly_payroll from employees where role = 'EMPLOYEE';
  
  return json_build_object(
    'total_employees', total_employees,
    'present_today', present_today,
    'absent_today', absent_today,
    'pending_leaves', pending_leaves,
    'on_leave', on_leave,
    'total_fines', total_fines,
    'monthly_payroll', monthly_payroll
  );
end;
$$;