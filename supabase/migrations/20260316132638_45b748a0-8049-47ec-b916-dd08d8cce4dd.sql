-- Create a table for streaming logs
CREATE TABLE public.test_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read logs (dashboard is internal tool)
CREATE POLICY "Anyone can read test_runs" ON public.test_runs FOR SELECT USING (true);

-- Allow anyone to insert logs (external systems write logs)
CREATE POLICY "Anyone can insert test_runs" ON public.test_runs FOR INSERT WITH CHECK (true);

-- Allow anyone to delete logs (dashboard clears logs)
CREATE POLICY "Anyone can delete test_runs" ON public.test_runs FOR DELETE USING (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE test_runs;