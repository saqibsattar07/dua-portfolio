import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_SESSION_ID_LENGTH = 100;
const MAX_MESSAGES_PER_SESSION = 100;

// In-memory rate limiting (per instance - for basic protection)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(key: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }
  
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { limited: true, remaining: 0 };
  }
  
  entry.count++;
  return { limited: false, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function validateInput(message: unknown, sessionId: unknown): { valid: boolean; error?: string } {
  // Validate message
  if (!message || typeof message !== 'string') {
    return { valid: false, error: "Message must be a non-empty string" };
  }
  
  const trimmedMessage = message.trim();
  if (trimmedMessage.length < 1) {
    return { valid: false, error: "Message cannot be empty" };
  }
  
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message must be less than ${MAX_MESSAGE_LENGTH} characters` };
  }
  
  // Validate sessionId
  if (!sessionId || typeof sessionId !== 'string') {
    return { valid: false, error: "Session ID is required" };
  }
  
  const trimmedSessionId = sessionId.trim();
  if (trimmedSessionId.length < 1 || trimmedSessionId.length > MAX_SESSION_ID_LENGTH) {
    return { valid: false, error: `Session ID must be between 1 and ${MAX_SESSION_ID_LENGTH} characters` };
  }
  
  // Basic format validation for session ID (should be UUID-like or alphanumeric)
  if (!/^[a-zA-Z0-9-_]+$/.test(trimmedSessionId)) {
    return { valid: false, error: "Session ID contains invalid characters" };
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Apply rate limiting
    const rateLimitKey = getRateLimitKey(req);
    const { limited, remaining } = isRateLimited(rateLimitKey);
    
    if (limited) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before sending more messages." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "Retry-After": "60"
          } 
        }
      );
    }

    // Parse and validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, sessionId } = body;
    
    // Validate inputs
    const validation = validateInput(message, sessionId);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const sanitizedMessage = message.trim().substring(0, MAX_MESSAGE_LENGTH);
    const sanitizedSessionId = sessionId.trim().substring(0, MAX_SESSION_ID_LENGTH);

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check session message count to prevent flooding
    const { count: messageCount, error: countError } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sanitizedSessionId);

    if (!countError && messageCount !== null && messageCount >= MAX_MESSAGES_PER_SESSION) {
      return new Response(
        JSON.stringify({ error: "Session message limit reached. Please start a new conversation." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all documents for RAG context
    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select("title, content")
      .limit(10);

    if (docsError) {
      console.error("Error fetching documents:", docsError);
    }

    // Build context from documents
    let context = "";
    if (documents && documents.length > 0) {
      context = documents
        .map((doc) => `## ${doc.title}\n${doc.content}`)
        .join("\n\n---\n\n");
    }

    // Fetch recent chat history for this session
    const { data: chatHistory, error: historyError } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sanitizedSessionId)
      .order("created_at", { ascending: true })
      .limit(20);

    if (historyError) {
      console.error("Error fetching chat history:", historyError);
    }

    // Build messages array
    const messages = [
      {
        role: "system",
        content: `You are Dua's helpful AI assistant on her portfolio website. You help visitors learn about Dua's work, skills, and services as a graphic designer.

${context ? `Here is information about Dua that you can use to answer questions:\n\n${context}` : ""}

Guidelines:
- Be friendly, professional, and helpful
- If you don't have specific information, be honest about it
- Keep responses concise and relevant
- Help visitors understand Dua's design expertise and services`,
      },
    ];

    // Add chat history
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach((msg) => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }

    // Add current message
    messages.push({ role: "user", content: sanitizedMessage });

    console.log("Calling OpenRouter API with", messages.length, "messages");

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "Dua Portfolio Chatbot",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Save messages to database
    await supabase.from("chat_messages").insert([
      { session_id: sanitizedSessionId, role: "user", content: sanitizedMessage },
      { session_id: sanitizedSessionId, role: "assistant", content: assistantMessage },
    ]);

    console.log("Chat completed successfully");

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": remaining.toString()
        } 
      }
    );
  } catch (error) {
    console.error("Error in rag-chat function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
