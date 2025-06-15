
-- Create cash register sessions table
CREATE TABLE public.cash_register_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  opening_amount NUMERIC NOT NULL DEFAULT 0,
  closing_amount NUMERIC DEFAULT NULL,
  expected_amount NUMERIC DEFAULT NULL,
  difference_amount NUMERIC DEFAULT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cash count table for tracking denominations
CREATE TABLE public.cash_counts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.cash_register_sessions(id) ON DELETE CASCADE,
  denomination INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  total_value NUMERIC GENERATED ALWAYS AS (denomination * count) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, denomination)
);

-- Add RLS policies
ALTER TABLE public.cash_register_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_counts ENABLE ROW LEVEL SECURITY;

-- Policies for cash register sessions
CREATE POLICY "Users can view their own cash register sessions" 
  ON public.cash_register_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cash register sessions" 
  ON public.cash_register_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cash register sessions" 
  ON public.cash_register_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies for cash counts
CREATE POLICY "Users can view cash counts for their sessions" 
  ON public.cash_counts 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.cash_register_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create cash counts for their sessions" 
  ON public.cash_counts 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cash_register_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update cash counts for their sessions" 
  ON public.cash_counts 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.cash_register_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

-- Function to get current active session for a user
CREATE OR REPLACE FUNCTION public.get_active_cash_session(user_id_param UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id 
  FROM public.cash_register_sessions 
  WHERE user_id = user_id_param AND status = 'open' 
  ORDER BY start_time DESC 
  LIMIT 1;
$$;
