
-- Create the test_runs table
CREATE TABLE public.test_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT,
  requirement_name TEXT DEFAULT 'Pending...',
  test_email TEXT DEFAULT '...',
  test_password TEXT DEFAULT '...',
  logs TEXT DEFAULT '',
  status TEXT DEFAULT 'idle',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read test_runs" ON public.test_runs FOR SELECT TO public USING (true);

-- Public insert access
CREATE POLICY "Anyone can insert test_runs" ON public.test_runs FOR INSERT TO public WITH CHECK (true);

-- Public update access
CREATE POLICY "Anyone can update test_runs" ON public.test_runs FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Public delete access
CREATE POLICY "Anyone can delete test_runs" ON public.test_runs FOR DELETE TO public USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_runs;
