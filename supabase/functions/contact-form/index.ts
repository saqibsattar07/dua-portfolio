import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5; // 5 submissions per hour per IP

// In-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Sheets webhook URL - loaded from environment
function getWebhookUrl(): string {
  const url = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
  if (!url) {
    throw new Error("GOOGLE_SHEETS_WEBHOOK_URL is not configured");
  }
  return url;
}

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

// Input validation
function validateFormData(data: unknown): { valid: boolean; error?: string; sanitized?: Record<string, string> } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Invalid form data" };
  }

  const { name, email, subject, message } = data as Record<string, unknown>;

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return { valid: false, error: "Name is required" };
  }
  if (name.length > 100) {
    return { valid: false, error: "Name is too long" };
  }

  // Validate email
  if (!email || typeof email !== 'string') {
    return { valid: false, error: "Email is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return { valid: false, error: "Invalid email address" };
  }

  // Validate subject
  if (!subject || typeof subject !== 'string' || subject.trim().length < 1) {
    return { valid: false, error: "Subject is required" };
  }
  if (subject.length > 200) {
    return { valid: false, error: "Subject is too long" };
  }

  // Validate message
  if (!message || typeof message !== 'string' || message.trim().length < 1) {
    return { valid: false, error: "Message is required" };
  }
  if (message.length > 5000) {
    return { valid: false, error: "Message is too long" };
  }

  return {
    valid: true,
    sanitized: {
      name: name.trim().substring(0, 100),
      email: email.trim().toLowerCase().substring(0, 254),
      subject: subject.trim().substring(0, 200),
      message: message.trim().substring(0, 5000),
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Apply rate limiting
    const clientIp = getRateLimitKey(req);
    const { limited, remaining } = isRateLimited(clientIp);
    
    if (limited) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "3600"
          } 
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize input
    const validation = validateFormData(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedData = validation.sanitized!;
    const formData = {
      name: sanitizedData.name,
      email: sanitizedData.email,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
      timestamp: new Date().toISOString(),
      ip: clientIp, // For spam tracking
    };

    console.log("Submitting contact form for:", sanitizedData.email);

    // Forward to Google Sheets webhook
    const webhookUrl = getWebhookUrl();
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      console.error("Google Sheets webhook error:", response.status);
      throw new Error("Failed to submit form");
    }

    console.log("Contact form submitted successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Form submitted successfully" }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": remaining.toString()
        } 
      }
    );
  } catch (error) {
    console.error("Error in contact-form function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
