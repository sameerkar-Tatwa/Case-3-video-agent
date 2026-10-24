// Cloudflare Worker: worker.js
// Secure Anam Session Token Minter & Dual Version Host (v1 Agent-Only & v2 Showcase)

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // =========================================================================
    // 1. DUAL VERSION & STATIC ASSET ROUTING
    // =========================================================================

    // Route: /v1, /v1/, /version1, /version1/ -> Serve v1 (Embedded Anam Agent Only)
    if (url.pathname === "/v1" || url.pathname === "/v1/" || url.pathname === "/version1" || url.pathname === "/version1/") {
      if (env.ASSETS) {
        const assetUrl = new URL("/v1.html", request.url);
        return env.ASSETS.fetch(new Request(assetUrl, request));
      }
    }

    // Route: /v2, /v2/, /version2, /version2/ -> Serve v2 (Iris Agent + Visual Showcase)
    if (url.pathname === "/v2" || url.pathname === "/v2/" || url.pathname === "/version2" || url.pathname === "/version2/") {
      if (env.ASSETS) {
        const assetUrl = new URL("/v2.html", request.url);
        return env.ASSETS.fetch(new Request(assetUrl, request));
      }
    }

    // Route: / or /visualizer or /index.html -> Serve default index.html (Version 2)
    if (url.pathname === "/visualizer" || url.pathname === "/visualizer/" || url.pathname === "/" || url.pathname === "/index.html") {
      if (env.ASSETS) {
        const assetUrl = new URL("/index.html", request.url);
        return env.ASSETS.fetch(new Request(assetUrl, request));
      }
    }

    // Static asset handling (e.g. /assets/... or /visualizer/assets/...)
    if (url.pathname.startsWith("/visualizer/assets/")) {
      if (env.ASSETS) {
        const cleanPath = url.pathname.replace(/^\/visualizer/, "");
        const assetUrl = new URL(cleanPath, request.url);
        return env.ASSETS.fetch(new Request(assetUrl, request));
      }
    }

    if (url.pathname.startsWith("/assets/")) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
    }

    // =========================================================================
    // 2. ENDPOINT: POST /api/session-token (Token Minter)
    // =========================================================================
    if (url.pathname === "/api/session-token" && request.method === "POST") {
      try {
        if (!env.ANAM_API_KEY) {
          return Response.json(
            { error: "ANAM_API_KEY is not configured in worker environment" },
            { status: 500, headers: corsHeaders }
          );
        }

        const personaId = env.ANAM_PERSONA_ID || "603598a2-e60a-41fd-a5f3-4347900dd2e5";
        const body = await request.json().catch(() => ({}));
        
        // Persona configuration with optional dynamic memory/systemPrompt injection
        const personaConfig = {
          personaId: personaId,
          ...(body.systemPrompt ? { systemPrompt: body.systemPrompt } : {})
        };

        const anamRes = await fetch("https://api.anam.ai/v1/auth/session-token", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.ANAM_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ personaConfig }),
        });

        if (!anamRes.ok) {
          const errText = await anamRes.text();
          return Response.json(
            { error: `Anam API error: ${anamRes.status}`, details: errText },
            { status: anamRes.status, headers: corsHeaders }
          );
        }

        const data = await anamRes.json();
        return Response.json(
          { sessionToken: data.sessionToken },
          { headers: corsHeaders }
        );
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // =========================================================================
    // 3. HEALTH CHECK
    // =========================================================================
    if (url.pathname === "/health") {
      return Response.json(
        { 
          status: "ok", 
          service: "CASE3 Iris Session Token Minter & Dual Version Host",
          versions: {
            v1: "/v1 (Embedded Anam Agent Only)",
            v2: "/v2 (Agent + Visual Showcase)",
            default: "/ (Showcase v2)"
          }
        },
        { headers: corsHeaders }
      );
    }

    // Fallback: If ASSETS binding is present, try resolving against static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
