# Product Requirements Document (PRD) & Technical Implementation Guide

**Project:** CASE3 Technologies — "Iris" Interactive AI Studio & Dynamic Visual Showcase
**Architecture Pattern:** Anam JavaScript SDK (`@anam-ai/js-sdk`) + Non-Blocking Client Tool + Cloudflare Workers Backend

## 1. Executive Summary & Objective

CASE3 Technologies requires an interactive split-screen AI ambassador experience. The left panel features **Iris** (Anam AI Avatar), and the right panel features a **Zero-Scroll Dynamic Visual Showcase**. 

As the user converses with Iris, the right panel must dynamically update its visual context (slides, images, QR codes) to match the topic of conversation. This must happen **asynchronously and instantaneously**, without causing Iris to pause, stutter, or announce that she is loading a screen.

## 2. Architecture Decision: Client Tools vs. Server Tools (Webhooks)

To achieve this, we must transition away from the simple `<anam-agent>` embed and use the **Anam JavaScript SDK**. We also must define how tools are handled. 

### Why we chose a **Client Tool** for UI Updates:
In your previous `Faber-image-tool` integration, you used a **Server Tool (Webhook)** because the AI platform needed to fetch data from an external server (Cloudflare) before answering. 

For CASE3's Dynamic UI, we are manipulating the DOM (HTML/CSS) running directly in the user's browser. A Server Tool cannot directly execute `window.goToSlide()` on the user's laptop. 
*   **The Client Tool Advantage:** By defining a `{ } Client tool` in Anam Lab, the Anam Engine sends the tool payload directly to the frontend browser via the WebRTC data channel. The browser catches it in $<5\text{ ms}$, updates the UI instantly, and returns a success string.

### The Role of Cloudflare in this Architecture:
While we use a Client Tool for the UI, we still need a **Cloudflare Worker** for two critical backend tasks:
1.  **Security (Session Tokens):** The Worker securely holds your `ANAM_API_KEY` and mints ephemeral session tokens for the frontend.
2.  **Memory & State:** The Worker can receive day-one transcripts from the frontend, store them in a database (like Cloudflare D1 or KV), and inject them into the Day-2 `systemPrompt` when minting a new token.

## 3. Trigger Mechanics & Semantic Intent Extraction

You do **not** need to write brittle code to extract exact trigger words (e.g., `if (text.includes("security"))`). Instead, we leverage the LLM's natural semantic extraction capabilities.

### How Intent Extraction Works in Anam:
1.  **The Schema:** We provide the LLM with a strictly typed JSON schema containing an `enum` of valid topics. 
2.  **Semantic Mapping:** If the user asks, *"How do you prevent data leaks and hallucinations?"*, the LLM semantically understands this relates to the `security` enum, even though the word "security" was never spoken.
3.  **The Trigger:** The LLM decides to fire the tool, formatting the payload as `{"topic": "security"}`.

### The Trigger Matrix

| User Semantic Intent / Questions | LLM Extracted Topic (`enum`) | Frontend UI Action (Triggered via SDK) |
| :--- | :--- | :--- |
| PolicyCenter, ClaimCenter, Guidewire Cloud, APD | `guidewire` | Calls `window.goToSlide(0)` |
| Autonomous platforms, AI agents writing code, CRUX | `apex` | Calls `window.goToSlide(1)` |
| How do we engage? Delivery pods, migration, upgrades | `execution` | Calls `window.goToSlide(2)` |
| Human-in-the-loop, data privacy, guardrails, compliance | `security` | Calls `window.goToSlide(4)` (New Slide) |
| Contact Manas Mishra, scan QR code, book meeting | `leadership` | Calls `window.goToSlide(3)` & Opens QR Modal |

## 4. The Non-Blocking Tool Pipeline (How to Never Stop the Agent)

The most critical requirement is that Iris **must not stop speaking** when a visual changes.

### The Three Rules of Non-Blocking UI:
1.  **Model Selection:** You **must** select an OpenAI model (e.g., `gpt-4o` or `gpt-4o-mini`) in Anam Lab. Models hosted by Groq do not support interleaved tool calling and will cause the audio to pause.
2.  **System Prompt Directives:** The LLM must be explicitly told not to pause or announce the UI change. *(e.g., "Invoke the tool silently at the very start of your turn and immediately deliver your spoken answer.")*
3.  **Synchronous Frontend Return:** In the JavaScript `onStart` handler, you must execute the DOM change and `return` a string instantly. Do not use `await` on slow processes inside this handler.

---

## 5. Implementation Guide & Codebase

### Step 5.1: Configure the Tool in Anam Lab
1. Go to Anam Lab -> Tools -> **+ Add tool**.
2. Select **{ } Client tool**.
3. **Name:** `update_visual_showcase`
4. **Description:** "Updates the visual presentation panel on the user's screen. Call this immediately when the conversation shifts to Guidewire modules, APEX platform, Execution models, Security/Governance, or Leadership/Contact info. Do not announce you are calling this tool."
5. **JSON Schema:**
```json
{
  "type": "object",
  "properties": {
    "topic": {
      "type": "string",
      "enum": ["guidewire", "apex", "execution", "leadership", "security"],
      "description": "The visual slide to display."
    }
  },
  "required": ["topic"]
}
```
6. **Save** and click **Publish** on your Persona. Add this to the Persona Prompt:
> **DYNAMIC UI RULES:** Whenever the user asks about a core topic, immediately invoke `update_visual_showcase` with the matching topic enum. Call the tool silently and begin speaking your answer immediately in the same breath.

### Step 5.2: Cloudflare Worker Backend (`worker.js`)
This creates your secure token minter.

```javascript
// Cloudflare Worker: worker.js
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { 
        headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } 
      });
    }

    if (new URL(request.url).pathname === "/api/session-token" && request.method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        
        // This is where you would inject Day 1 Memory into the systemPrompt for returning users
        const personaConfig = {
          personaId: env.ANAM_PERSONA_ID,
          // systemPrompt: "Optional dynamic memory injection goes here" 
        };

        const anamRes = await fetch("https://api.anam.ai/v1/auth/session-token", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.ANAM_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ personaConfig }),
        });

        const data = await anamRes.json();
        return Response.json({ sessionToken: data.sessionToken }, { 
            headers: { "Access-Control-Allow-Origin": "*" } 
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }
    return new Response("Not Found", { status: 404 });
  },
};
```

### Step 5.3: Frontend JS SDK Wrapper (`index.html` logic)
Remove the `<anam-agent>` web component and `<script async>` tag. Replace the persona video container with `<video id="iris-video" class="w-full h-full object-cover" autoplay playsinline></video>`. 

Then, place this script at the bottom of your HTML to handle the Non-Blocking Client Tool:

```html
<script type="module">
    import { createClient, AnamEvent } from "https://esm.sh/@anam-ai/js-sdk";

    async function startIrisSession() {
        const statusEl = document.getElementById('session-status');
        statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span class="text-amber-300">Connecting...</span>`;

        try {
            // 1. Fetch Token from your Cloudflare Worker
            // Ensure you update this URL to your actual local/production Cloudflare Worker URL
            const res = await fetch("http://localhost:8787/api/session-token", { method: "POST" });
            const data = await res.json();
            
            // 2. Initialize Anam SDK
            const anamClient = createClient(data.sessionToken);

            // 3. Register the Non-Blocking Client Tool Handler
            anamClient.registerToolCallHandler("update_visual_showcase", {
                onStart: (payload) => {
                    const topic = payload.arguments.topic;
                    
                    const topicMap = {
                        "guidewire": 0,
                        "apex": 1,
                        "execution": 2,
                        "leadership": 3,
                        "security": 4 
                    };

                    // Execute DOM update asynchronously so we don't block the thread
                    requestAnimationFrame(() => {
                        if (typeof window.goToSlide === 'function') {
                            window.goToSlide(topicMap[topic] || 0);
                        }
                        // Optional: Show QR modal if leadership is selected
                        if (topic === 'leadership' && typeof window.toggleQrModal === 'function') {
                            window.toggleQrModal(true);
                        }
                    });

                    // INSTANT RETURN: The engine receives this in 1ms and resumes speaking instantly
                    return `Visuals updated to ${topic}.`;
                }
            });

            // 4. Stream to the video element
            await anamClient.streamToVideoElement("iris-video");
            
            statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span class="text-emerald-300">Agent Live</span>`;
        } catch (err) {
            console.error("Session failed:", err);
            statusEl.innerHTML = `<span class="text-red-400">Connection Failed</span>`;
        }
    }

    // Trigger this function when the user clicks a "Start Session" overlay button
    // (Browsers require a user interaction before WebRTC can play audio)
    document.getElementById('btn-start-session').addEventListener('click', startIrisSession);
</script>
```

---

## 6. Testing & Deployment Guide

### Phase 1: Local Testing
1.  **Install Cloudflare Wrangler:** In your project terminal, run `npm init -y` and `npm install -D wrangler`.
2.  **Create `.dev.vars`:** In the root directory, create this file and add your secrets (Never commit this to Github):
    ```
    ANAM_API_KEY="your_secret_key_here"
    ANAM_PERSONA_ID="your_persona_uuid"
    ```
3.  **Create `wrangler.toml`:**
    ```toml
    name = "case3-iris-worker"
    main = "worker.js"
    compatibility_date = "2026-10-23"
    ```
4.  **Run Local Worker:** Execute `npx wrangler dev`. It will start a local server at `http://localhost:8787`.
5.  **Serve HTML:** Serve your `index.html` file locally using a basic HTTP server (e.g., VS Code Live Server or `python -m http.server 8000`). Make sure the fetch URL in your HTML points to the `localhost:8787` worker.
6.  **Test:** Speak to Iris and say, *"Tell me about your security and deterministic governance."* Watch the UI switch instantly while she answers.

### Phase 2: Deploy to Cloudflare
1.  **Authenticate:** Run `npx wrangler login`.
2.  **Set Secrets:** Run `npx wrangler secret put ANAM_API_KEY` and paste your key. Repeat for `ANAM_PERSONA_ID`.
3.  **Deploy:** Run `npx wrangler deploy`. 
4.  Cloudflare will give you a live URL (e.g., `https://case3-iris-worker.your-subdomain.workers.dev`).
5.  **Update Frontend:** Change the `fetch` URL in your `index.html` to point to this new live Cloudflare URL. Your frontend is now fully integrated with your secure cloud backend.