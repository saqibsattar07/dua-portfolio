import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId } = await req.json();
    
    if (!message) {
      throw new Error("Message is required");
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      .eq("session_id", sessionId)
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
    messages.push({ role: "user", content: message });

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
      { session_id: sessionId, role: "user", content: message },
      { session_id: sessionId, role: "assistant", content: assistantMessage },
    ]);

    console.log("Chat completed successfully");

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in rag-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
