-- Create a table for streaming logs
CREATE TABLE public.test_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read logs (dashboard is internal tool)
CREATE POLICY "Anyone can read test_logs" ON public.test_logs FOR SELECT USING (true);

-- Allow anyone to insert logs (external systems write logs)
CREATE POLICY "Anyone can insert test_logs" ON public.test_logs FOR INSERT WITH CHECK (true);

-- Allow anyone to delete logs (dashboard clears logs)
CREATE POLICY "Anyone can delete test_logs" ON public.test_logs FOR DELETE USING (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE test_logs;