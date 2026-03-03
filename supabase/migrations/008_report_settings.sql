-- Report settings for analytics PDF export
create table if not exists public.report_settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    company_name text not null default 'She Does Socials',
    logo_url text not null default '',
    accent_color text not null default '#f472b6',
    header_text text not null default 'Monthly Performance Report',
    footer_text text not null default 'Prepared by She Does Socials',
    show_overview boolean not null default true,
    show_platform_breakdown boolean not null default true,
    show_weekly_charts boolean not null default true,
    show_top_posts boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(user_id)
);

-- RLS
alter table public.report_settings enable row level security;

create policy "Users can view own report settings"
    on public.report_settings for select
    using (auth.uid() = user_id);

create policy "Users can insert own report settings"
    on public.report_settings for insert
    with check (auth.uid() = user_id);

create policy "Users can update own report settings"
    on public.report_settings for update
    using (auth.uid() = user_id);
