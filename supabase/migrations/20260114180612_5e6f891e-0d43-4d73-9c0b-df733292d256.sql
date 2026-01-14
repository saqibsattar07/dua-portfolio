-- First, drop the overly permissive RLS policies on chat_messages
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can read chat messages" ON public.chat_messages;

-- Create restrictive policies that only allow service role access
-- This ensures all chat operations must go through the edge function
CREATE POLICY "Service role can manage chat messages"
ON public.chat_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add a session_owners table to track session ownership
CREATE TABLE IF NOT EXISTS public.session_owners (
  session_id TEXT PRIMARY KEY,
  owner_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
  message_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on session_owners
ALTER TABLE public.session_owners ENABLE ROW LEVEL SECURITY;

-- Only service role can access session_owners
CREATE POLICY "Service role can manage session owners"
ON public.session_owners
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_session_owners_fingerprint ON public.session_owners(owner_fingerprint);
CREATE INDEX IF NOT EXISTS idx_session_owners_last_active ON public.session_owners(last_active);