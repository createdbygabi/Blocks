-- Create analytics_events table
create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  session_id text not null,
  event_name text not null,
  properties jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists analytics_events_business_id_idx on analytics_events(business_id);
create index if not exists analytics_events_event_name_idx on analytics_events(event_name);
create index if not exists analytics_events_created_at_idx on analytics_events(created_at);

-- Enable Row Level Security
alter table analytics_events enable row level security;

-- Create policy to allow businesses to insert their own analytics
create policy "Businesses can insert their own analytics"
  on analytics_events
  for insert
  to authenticated
  with check (
    business_id in (
      select id from businesses 
      where id = auth.uid() 
      or id in (
        select business_id from business_members 
        where user_id = auth.uid()
      )
    )
  );

-- Create policy to allow businesses to view their own analytics
create policy "Businesses can view their own analytics"
  on analytics_events
  for select
  to authenticated
  using (
    business_id in (
      select id from businesses 
      where id = auth.uid() 
      or id in (
        select business_id from business_members 
        where user_id = auth.uid()
      )
    )
  ); 