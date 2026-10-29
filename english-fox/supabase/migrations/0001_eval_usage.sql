-- Daily call counter for the evaluate function (spec 6.3 limits). Only the service role touches it.
create table if not exists public.eval_usage (
  user_key text not null,
  date date not null,
  calls int not null default 0,
  primary key (user_key, date)
);
alter table public.eval_usage enable row level security;
-- no policies: anon/authenticated cannot read or write, service_role bypasses RLS
