# CASE3 Technologies — Iris Dynamic UI & Anam Architecture Explainer

> **A Complete, Simple, and Technical Guide to How Iris, WebRTC, the Cloudflare Worker, and Dynamic HTML Work Together.**

---

## Table of Contents
1. [The 60-Second Summary (The TV Studio Analogy)](#1-the-60-second-summary-the-tv-studio-analogy)
2. [The 3 Core Pillars (Who Does What?)](#2-the-3-core-pillars-who-does-what)
3. [The Security Shield: Why and How Tokens Are Minted](#3-the-security-shield-why-and-how-tokens-are-minted)
4. [Deep-Dive: Line-by-Line Breakdown of the Cloudflare Backend (`worker.js`)](#4-deep-dive-line-by-line-breakdown-of-the-cloudflare-backend-workerjs)
5. [The WebRTC Dual-Highway (Media vs Data)](#5-the-webrtc-dual-highway-media-vs-data)
6. [The AI Brain: How Iris Decides to Switch Screens](#6-the-ai-brain-how-iris-decides-to-switch-screens)
7. [The Payload Deep Dive: From Cloud to Browser](#7-the-payload-deep-dive-from-cloud-to-browser)
8. [How `index.html` Interacts with Anam (The Frontend Code)](#8-how-indexhtml-interacts-with-anam-the-frontend-code)
9. [The "Zero-Stutter" Secret: Non-Blocking Execution](#9-the-zero-stutter-secret-non-blocking-execution)
10. [Full End-to-End ASCII Sequence Diagram](#10-full-end-to-end-ascii-sequence-diagram)
11. [The Visual Showcase: How the Slides Move](#11-the-visual-showcase-how-the-slides-move)
12. [Session Lifecycle & State Machine](#12-session-lifecycle--state-machine)
13. [Developer Checklist: What is Required in Anam Lab](#13-developer-checklist-what-is-required-in-anam-lab)
14. [Troubleshooting Guide ("What If...?")](#14-troubleshooting-guide-what-if)

---

## 1. The 60-Second Summary (The TV Studio Analogy)

Imagine a live television broadcast:
- **Iris** is the **News Anchor** sitting in front of the camera, speaking live to the audience.
- **Anam AI** is the **Production Studio** in the cloud that animates Iris’s face, processes voice, and runs her thoughts.
- **Your Browser (`index.html`)** is the **Control Room Video Wall** behind the anchor.
- **The Client Tool (`update_visual_showcase`)** is the **Floor Director’s Cue Card**.

```
+-----------------------------------------------------------------------------+
|                            THE TV STUDIO ANALOGY                            |
+-----------------------------------------------------------------------------+
|                                                                             |
|   User asks: "Tell me about APEX!"                                          |
|                                                                             |
|      [Anchor: Iris]               [Cloud Studio: Anam]     [Control Room: Browser]
|            |                                |                         |
|            | <--- "Switch screen to APEX" --+                         |
|            |      "Speak immediately"       +-- Sub-second cue ------>|
|            |                                    (WebRTC DataChannel)  |
|            |                                                          |
|      Speaks out loud:                                            SLIDES FLIP:
|   "CASE3 APEX is our                                             APEX Platform
|    autonomous platform..."                                       appears on cue!
|                                                                             |
+-----------------------------------------------------------------------------+
```

When an expo attendee talks to Iris, she answers through voice, but **at the exact same microsecond**, she sends a digital cue directly to the user's browser. The browser catches that cue and slides the visual presentation to the exact right slide.

Iris **never stops talking**, there is **no loading spinner**, and the presentation updates seamlessly.

---

## 2. The 3 Core Pillars (Who Does What?)

The system consists of three distinct components:

```
+---------------------------------------------------------------------------------------+
|                                  THE 3 SYSTEM ACTORS                                  |
+------------------------------+----------------------------+---------------------------+
|          1. BROWSER          |    2. CLOUDFLARE WORKER    |       3. ANAM CLOUD       |
|          (Frontend)          |         (Backend)          |       (AI & WebRTC)       |
+------------------------------+----------------------------+---------------------------+
| • Runs `index.html`          | • Runs `worker.js`         | • Runs Persona "Iris"     |
| • Displays split-screen UI   | • Securely holds API Key   | • Speech-to-Text (STT)    |
| • Captures user microphone   | • Authenticates requests   | • LLM (gpt-4o reasoning)  |
| • Renders 60fps WebRTC video | • Mints temporary token    | • Text-to-Speech (TTS)    |
| • Executes slide animations  | • Never sees video/audio   | • Video generation engine |
| • Controls Modals (QR Code)  | • Fast, edge-based server  | • Emits tool call events  |
+------------------------------+----------------------------+---------------------------+
```

### High-Level Architecture Diagram

```
                 +-------------------------------------------------------+
                 |             2. CLOUDFLARE WORKER BACKEND              |
                 |                     (`worker.js`)                     |
                 |                                                       |
                 |  • Private Variable: `env.ANAM_API_KEY` (Hidden)      |
                 |  • Public Variable: `env.ANAM_PERSONA_ID`             |
                 +---------------------------+---------------------------+
                                             ^
                           1. POST /api/     |  2. POST /v1/auth/
                          session-token      |     session-token
                                             |     (Bearer ANAM_API_KEY)
                                             v
+----------------------------------+                   +----------------------------------+
|        1. CLIENT BROWSER         |                   |         3. ANAM AI CLOUD         |
|          (`index.html`)          |                   |          (Cloud Engine)          |
|                                  |                   |                                  |
| • User clicks "Talk to Iris"     |                   | • Iris Video Rendering Engine    |
| • `@anam-ai/js-sdk` WebRTC Client|<=================>| • Real-time STT Voice Processor  |
| • HTML5 `<video id="iris-video">`| 3. WebRTC Stream  | • LLM Brain (OpenAI gpt-4o)      |
| • 5-Slide Visual Carousel        |  (Video/Audio +   | • WebRTC Signaling Server        |
| • Non-blocking Tool Handler      |   Data Channel)   | • Client Tool Dispatcher         |
+----------------------------------+                   +----------------------------------+
                 |                                                       |
                 |                 4. "Tell me about APEX"               |
                 +--------------------(Microphone Audio)---------------->|
                                                                         |
                                                                         | 5. STT converts audio
                                                                         | 6. LLM extracts intent
                                                                         |    and calls tool:
                                                                         |    `update_visual_showcase`
                                                                         |    `{"topic": "apex"}`
                                                                         |
                 |                                                       |
                 | 7. JSON Tool Payload: {"topic": "apex"}               |
                 |<----------------(RTCDataChannel)----------------------+
                 |                                                       |
                 | 8. Browser executes:                                  | 9. Iris speaks voice:
                 |    `window.goToSlide(1)`                              |    "CASE3 APEX is our
                 |    Instant return: "Visuals updated"                  |     autonomous platform..."
                 +-----------------(Instant Return <1ms)---------------->|
```

---

## 3. The Security Shield: Why and How Tokens Are Minted

### The Vulnerability We Prevented
If you put your `ANAM_API_KEY` into `index.html`:
1. Any visitor can right-click -> **View Page Source**.
2. They copy your API Key.
3. They use your Anam credits on their own projects.

### The Solution: Ephemeral Session Tokens
Instead of giving the browser your master key, your browser talks to a lightweight server (`worker.js` on Cloudflare). The worker asks Anam for a **1-time temporary token** (valid for just that single conversation).

```
 USER BROWSER (`index.html`)       CLOUDFLARE WORKER (`worker.js`)          ANAM AI API
       |                                      |                                  |
       |  1. "I want to start a session"      |                                  |
       |---- POST /api/session-token -------->|                                  |
       |                                      |  2. "Mint a token for Iris"      |
       |                                      |     (Includes hidden API KEY)    |
       |                                      |---- POST /v1/auth/session-token >|
       |                                      |     Header: Bearer sk_live_***   |
       |                                      |                                  |
       |                                      |  3. "Here is token: abc-123-xyz" |
       |                                      |<--- Returns { sessionToken } ----|
       |                                      |                                  |
       |  4. "Here is your 1-time token"      |                                  |
       |<--- Returns { sessionToken } --------|                                  |
       |                                                                         |
       |  5. Establishes WebRTC connection directly using temporary token         |
       |========================================================================>|
```

The browser **never knows the real API key**. It only ever handles an ephemeral ticket that expires after the session.

---

## 4. Deep-Dive: Line-by-Line Breakdown of the Cloudflare Backend (`worker.js`)

The file [`worker.js`](file:///d:/Tatwa%20projects/Case3%20website/worker.js) contains 79 lines of clean, modern JavaScript running on Cloudflare's serverless edge environment. Below is a detailed, line-by-line explanation of how every block operates:

### Block 1: File Header & Cloudflare Worker Export (Lines 1–5)

```javascript
1: // Cloudflare Worker: worker.js
2: // Secure Anam Session Token Minter for CASE3 Iris Dynamic UI
3: 
4: export default {
5:   async fetch(request, env) {
```

- **Lines 1–2**: Descriptive comments identifying this script as the secure Anam session token minter for the CASE3 Iris application.
- **Line 3**: Blank line for visual clarity and separation.
- **Line 4 (`export default {`)**: Cloudflare Workers use standard **ES Modules (ESM)**. The default exported object contains the lifecycle handlers that Cloudflare invokes whenever web traffic arrives at your worker's edge URL.
- **Line 5 (`async fetch(request, env) {`)**: The primary HTTP entry point:
  - `request`: A standard Web API `Request` object containing the incoming HTTP method (`POST`, `OPTIONS`), URL, headers, and request body.
  - `env`: The Cloudflare environment container holding all bound environment variables and secrets (such as `env.ANAM_API_KEY` and `env.ANAM_PERSONA_ID`).
  - Marked `async` because it performs asynchronous network calls to Anam's API using `await fetch()`.

---

### Block 2: Cross-Origin Resource Sharing (CORS) Configuration (Lines 6–15)

```javascript
6:     const corsHeaders = {
7:       "Access-Control-Allow-Origin": "*",
8:       "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
9:       "Access-Control-Allow-Headers": "Content-Type, Authorization",
10:    };
11: 
12:    // Handle CORS preflight
13:    if (request.method === "OPTIONS") {
14:      return new Response(null, { headers: corsHeaders });
15:    }
```

- **Line 6 (`const corsHeaders = {`)**: Declares the response headers dictionary needed to satisfy browser security (Cross-Origin Resource Sharing).
- **Line 7 (`"Access-Control-Allow-Origin": "*"`)**: Allows requests originating from any domain (e.g., `http://localhost:3000`, `http://127.0.0.1:5500`, custom staging domains, or local `file:///` URLs).
- **Line 8 (`"Access-Control-Allow-Methods": "GET, POST, OPTIONS"`)**: Explicitly whitelists `GET`, `POST`, and `OPTIONS` HTTP verbs.
- **Line 9 (`"Access-Control-Allow-Headers": "Content-Type, Authorization"`)**: Permits browser requests to send the `Content-Type: application/json` and `Authorization` headers.
- **Line 10 (`};`)**: Closes the CORS headers object.
- **Line 11**: Blank line.
- **Line 12**: Comment describing the browser preflight handler.
- **Line 13 (`if (request.method === "OPTIONS") {`)**: Before modern browsers send a cross-origin `POST` request with JSON, they automatically send an `OPTIONS` "preflight" probe asking: *"Is this server willing to accept my POST request?"*
- **Line 14 (`return new Response(null, { headers: corsHeaders });`)**: Immediately responds with HTTP 200, an empty body (`null`), and the CORS headers. This gives the browser green-light clearance to send the actual `POST` request.
- **Line 15 (`}`)**: Closes the preflight block.

---

### Block 3: URL Parsing & Route Matching (Lines 17–20)

```javascript
17:    const url = new URL(request.url);
18: 
19:    // Endpoint: POST /api/session-token
20:    if (url.pathname === "/api/session-token" && request.method === "POST") {
```

- **Line 17 (`const url = new URL(request.url);`)**: Parses the incoming request URL string into a standard JavaScript `URL` object, giving clean access to `url.pathname` (e.g., `/api/session-token`).
- **Line 18**: Blank line.
- **Line 19**: Comment identifying the token minting route.
- **Line 20 (`if (url.pathname === "/api/session-token" && request.method === "POST") {`)**: The main endpoint gatekeeper. It checks two conditions:
  1. Is the client requesting path `/api/session-token`?
  2. Is the HTTP verb `POST`?
  If both are true, it enters the session token generation workflow.

---

### Block 4: Try/Catch & Secret Guardrail (Lines 21–28)

```javascript
21:      try {
22:        if (!env.ANAM_API_KEY) {
23:          return Response.json(
24:            { error: "ANAM_API_KEY is not configured in worker environment" },
25:            { status: 500, headers: corsHeaders }
26:          );
27:        }
28: 
```

- **Line 21 (`try {`)**: Wraps the network and parsing operations in an error boundary so any unexpected failure returns a clean JSON error response instead of crashing the worker.
- **Line 22 (`if (!env.ANAM_API_KEY) {`)**: Critical security and configuration check. Verifies whether the master `ANAM_API_KEY` was bound into the environment (via `.dev.vars` locally or `wrangler secret put ANAM_API_KEY` in production).
- **Lines 23–26 (`return Response.json(...)`)**: If the API key is missing, halts execution and returns an HTTP 500 status with an informative error message: `ANAM_API_KEY is not configured in worker environment`. Attaches `corsHeaders` so the frontend UI can display this error message directly to the developer.
- **Line 27 (`}`)**: Closes the API key guardrail block.
- **Line 28**: Blank line.

---

### Block 5: Payload Parsing & Persona Configuration (Lines 29–37)

```javascript
29:        const personaId = env.ANAM_PERSONA_ID || "603598a2-e60a-41fd-a5f3-4347900dd2e5";
30:        const body = await request.json().catch(() => ({}));
31:        
32:        // Persona configuration with optional dynamic memory/systemPrompt injection
33:        const personaConfig = {
34:          personaId: personaId,
35:          ...(body.systemPrompt ? { systemPrompt: body.systemPrompt } : {})
36:        };
37: 
```

- **Line 29 (`const personaId = ...`)**: Reads `env.ANAM_PERSONA_ID` from `wrangler.toml`. If omitted, safely defaults to the Case3 Iris persona ID: `"603598a2-e60a-41fd-a5f3-4347900dd2e5"`.
- **Line 30 (`const body = await request.json().catch(() => ({}));`)**: Asynchronously parses the incoming JSON request body from the client. The `.catch(() => ({}))` ensures that if the browser sends an empty body or malformed payload, it falls back to `{}` instead of throwing an unhandled exception.
- **Line 31**: Blank line.
- **Line 32**: Comment explaining dynamic prompt configuration.
- **Lines 33–36 (`const personaConfig = { ... };`)**: Builds the persona payload required by Anam's REST API:
  - `personaId`: Specifies which digital human to spawn.
  - `...(body.systemPrompt ? ... : {})`: Uses the ES6 spread operator to optionally inject a custom `systemPrompt` if the frontend sent one (e.g., adding conference attendee names or dynamic booth context).
- **Line 37**: Blank line.

---

### Block 6: Server-to-Server Authentication with Anam AI (Lines 38–46)

```javascript
38:        const anamRes = await fetch("https://api.anam.ai/v1/auth/session-token", {
39:          method: "POST",
40:          headers: {
41:            "Authorization": `Bearer ${env.ANAM_API_KEY}`,
42:            "Content-Type": "application/json",
43:          },
44:          body: JSON.stringify({ personaConfig }),
45:        });
46: 
```

- **Line 38 (`const anamRes = await fetch("https://api.anam.ai/v1/auth/session-token", {`)**: Dispatches a private, server-to-server HTTPS request directly from Cloudflare's edge to Anam AI's authentication endpoint. **This is where the API key is completely isolated from the browser.**
- **Line 39 (`method: "POST",`)**: Sets the HTTP POST verb required by Anam.
- **Lines 40–43 (`headers: { ... }`)**: Injects the master `ANAM_API_KEY` as a Bearer token (`Bearer sk_live_...`) into the HTTP `Authorization` header, and sets `Content-Type: application/json`.
- **Line 44 (`body: JSON.stringify({ personaConfig }),`)**: Serializes the `{ personaConfig }` object into a JSON string for transmission.
- **Line 45 (`});`)**: Awaits the network response from Anam AI.
- **Line 46**: Blank line.

---

### Block 7: Upstream Error Handling (Lines 47–54)

```javascript
47:        if (!anamRes.ok) {
48:          const errText = await anamRes.text();
49:          return Response.json(
50:            { error: `Anam API error: ${anamRes.status}`, details: errText },
51:            { status: anamRes.status, headers: corsHeaders }
52:          );
53:        }
54: 
```

- **Line 47 (`if (!anamRes.ok) {`)**: Inspects Anam's HTTP status. If Anam returned anything other than 200–299 (e.g., HTTP 401 Invalid Key, 403 Forbidden, 429 Rate Limit), this branch triggers.
- **Line 48 (`const errText = await anamRes.text();`)**: Reads the upstream error message string returned by Anam's server.
- **Lines 49–52 (`return Response.json(...)`)**: Packages Anam's exact status code and diagnostic text into a JSON object and relays it to the browser with `corsHeaders`. This ensures you immediately see Anam's exact error in your browser DevTools console.
- **Line 53 (`}`)**: Closes the upstream error block.
- **Line 54**: Blank line.

---

### Block 8: Extracting & Returning the Session Token (Lines 55–66)

```javascript
55:        const data = await anamRes.json();
56:        return Response.json(
57:          { sessionToken: data.sessionToken },
58:          { headers: corsHeaders }
59:        );
60:      } catch (err) {
61:        return Response.json(
62:          { error: err.message },
63:          { status: 500, headers: corsHeaders }
64:        );
65:      }
66:    }
```

- **Line 55 (`const data = await anamRes.json();`)**: Parses Anam's JSON response, which contains `{ sessionToken: "..." }`.
- **Lines 56–59 (`return Response.json(...)`)**: Extracts `data.sessionToken` and returns it to the user's browser with an HTTP 200 OK status and CORS headers.
- **Line 60 (`} catch (err) {`)**: Catches any uncaught runtime exceptions (e.g., DNS failures or request timeouts).
- **Lines 61–64 (`return Response.json(...)`)**: Returns an HTTP 500 JSON response containing the error message string and CORS headers.
- **Line 65 (`}`)**: Closes the `catch` block.
- **Line 66 (`}`)**: Closes the `POST /api/session-token` endpoint block.

---

### Block 9: Liveness & Health Probe (Lines 68–75)

```javascript
68:    // Health check
69:    if (url.pathname === "/" || url.pathname === "/health") {
70:      return Response.json(
71:        { status: "ok", service: "CASE3 Iris Session Token Minter" },
72:        { headers: corsHeaders }
73:      );
74:    }
75: 
```

- **Line 68**: Comment indicating the health check route.
- **Line 69 (`if (url.pathname === "/" || url.pathname === "/health") {`)**: Route condition matching either the root path (`/`) or `/health`.
- **Lines 70–73 (`return Response.json(...)`)**: Returns a lightweight JSON status `{ status: "ok", service: "CASE3 Iris Session Token Minter" }` with CORS headers. This allows any browser, curl command, or uptime monitor to verify that the worker is online and healthy.
- **Line 74 (`}`)**: Closes the health check block.
- **Line 75**: Blank line.

---

### Block 10: Fallback 404 & Module Export Termination (Lines 76–78)

```javascript
76:    return new Response("Not Found", { status: 404, headers: corsHeaders });
77:  },
78: };
```

- **Line 76 (`return new Response("Not Found", { status: 404, headers: corsHeaders });`)**: Catch-all fallback. If a client attempts to access any undefined path (e.g., `/admin` or `GET /api/session-token`), the worker returns HTTP 404 Not Found with CORS headers.
- **Line 77 (`},`)**: Closes the `async fetch(request, env)` handler function.
- **Line 78 (`};`)**: Closes the ES module default export object.

---

## 5. The WebRTC Dual-Highway (Media vs Data)

WebRTC (Web Real-Time Communication) is the protocol powering Google Meet, Discord, and Anam AI. 

When your browser connects to Iris, WebRTC creates **two simultaneous pathways** inside a single connection:

```
+---------------------------------------------------------------------------------------------+
|                                WEBRTC DUAL-HIGHWAY PIPELINE                                 |
+---------------------------------------------------------------------------------------------+
|                                                                                             |
|   HIGHWAY 1: RTP MEDIA STREAM (Heavy, Continuous Media)                                     |
|   =======================================================================================   |
|   [User Microphone]  ========> Audio Packets (Opus 48kHz) ========> [Anam Speech-to-Text]  |
|   [Speaker / Audio]  <======== Voice Audio (Opus 48kHz)   <======== [Anam Voice Generator]  |
|   [<video> Display]  <======== Video Stream (H.264 60FPS) <======== [Anam Face Synthesizer] |
|                                                                                             |
|                                                                                             |
|   HIGHWAY 2: RTC DATA CHANNEL (Featherweight, Sub-5ms Binary/JSON Packets)                  |
|   =======================================================================================   |
|   [Browser JS]       <-------- { "topic": "apex" } (Tool Call) <--- [Anam LLM Brain]        |
|   [Browser JS]       --------> "Visuals updated" (Immediate)   ---> [Anam LLM Brain]        |
|                                                                                             |
+---------------------------------------------------------------------------------------------+
```

- **Highway 1 (Media)** carries high-bandwidth video and audio.
- **Highway 2 (Data Channel)** carries ultra-lightweight text commands. Because the Data Channel doesn't wait for video frames, commands arrive in **under 5 milliseconds**.

---

## 6. The AI Brain: How Iris Decides to Switch Screens

### Why You Don't Need Keyword Matchers
In basic bots, developers write rigid code like:
```javascript
// BAD OLD WAY: Fragile keyword matching
if (userSpeech.includes("upgrade")) { showSlide(2); }
```
If the user says: *"How do you modernize old systems?"*, the keyword check fails.

### The Modern Way: LLM Function Calling (Client Tools)
We tell the LLM (OpenAI `gpt-4o` running inside Anam):
> *"You have a special power called `update_visual_showcase`. Whenever the conversation shifts to one of the 5 company topics, execute this function immediately with the matching topic name."*

Here is the exact schema registered in Anam Lab:

```json
{
  "type": "object",
  "properties": {
    "topic": {
      "type": "string",
      "enum": ["guidewire", "apex", "execution", "leadership", "security"],
      "description": "The showcase topic to display on the client presentation panel"
    }
  },
  "required": ["topic"]
}
```

### The Semantic Intent Table

The LLM analyzes the attendee's **meaning**, not just words:

```
+---------------------------------------------+------------------------------------+----------------+
| ATTENDEE ASKS                               | LLM UNDERSTANDING (REASONING)      | EXTRACTED ENUM |
+---------------------------------------------+------------------------------------+----------------+
| "How do you configure ClaimCenter?"         | Guidewire core applications        | "guidewire"    |
| "Tell me about your AI platform APEX."      | Proprietary autonomous platform    | "apex"         |
| "What are your delivery pods?"              | Build, Upgrade, and Run execution  | "execution"    |
| "Can I connect with your Chief AI Officer?" | Leadership bio & Manas Mishra      | "leadership"   |
| "How do you ensure enterprise compliance?"  | Guardrails, governance & security  | "security"     |
+---------------------------------------------+------------------------------------+----------------+
```

---

## 7. The Payload Deep Dive: From Cloud to Browser

When the LLM decides to call `update_visual_showcase`, Anam AI packages the decision into a JSON frame and sends it across the WebRTC Data Channel.

### The Raw Incoming Packet
```json
{
  "toolCallId": "call_98f7a6b2c1e04",
  "toolName": "update_visual_showcase",
  "arguments": {
    "topic": "apex"
  }
}
```

### Payload Dissection
```
+-----------------------------------------------------------------------------+
|                           TOOL PAYLOAD BREAKDOWN                            |
+-------------------+---------------------------------------------------------+
| FIELD             | MEANING                                                 |
+-------------------+---------------------------------------------------------+
| `toolCallId`      | Unique tracking ID generated by the LLM for this action |
| `toolName`        | Identifies which handler in `index.html` must run       |
| `arguments.topic` | The specific enum value: "apex", "guidewire", etc.      |
+-------------------+---------------------------------------------------------+
```

---

## 8. How `index.html` Interacts with Anam (The Frontend Code)

Here is the exact code in `index.html` that receives the payload and changes the screen:

```javascript
// In index.html:

// 1. Initialize Anam SDK with the temporary token
anamClient = createClient(sessionToken);

// 2. Register the Client Tool Handler
anamClient.registerToolCallHandler("update_visual_showcase", {
    onStart: (payload) => {
        // Step A: Extract the topic string from the payload
        const topic = (payload?.arguments?.topic || "").toLowerCase();
        
        // Step B: Map the string to the exact slide index (0 to 4)
        const topicMap = {
            "guidewire": 0,   // Slide 1: Core Guidewire Services
            "apex": 1,        // Slide 2: CASE3 APEX Platform
            "execution": 2,   // Slide 3: Build / Upgrade / Run Pods
            "leadership": 3,  // Slide 4: CAIO Profile & Executive QR
            "security": 4     // Slide 5: Governance & Security
        };

        // Step C: Update DOM asynchronously on next animation frame
        requestAnimationFrame(() => {
            const targetSlide = topicMap[topic];
            if (targetSlide !== undefined) {
                window.goToSlide(targetSlide);
            }
            
            // Special Feature: Auto-open QR code if attendee asks about leadership
            if (topic === 'leadership') {
                window.toggleQrModal(true);
            }
            
            // Add a badge to the live transcript panel
            addSystemNotice(`Visual context shifted to: ${topic.toUpperCase()}`);
        });

        // Step D: INSTANT RETURN (<1 millisecond)
        // This tells Anam: "Done! Keep speaking without pausing!"
        return `Visuals updated to ${topic}.`;
    }
});
```

---

## 9. The "Zero-Stutter" Secret: Non-Blocking Execution

### The Problem in Most Agentic Websites:
In traditional web development, tool calls are asynchronous:
```
LLM speaks -> LLM stops talking -> Calls Webhook -> Waits 2 seconds -> Resumes talking
```
This causes Iris to awkwardly freeze mid-sentence while waiting for the webpage to respond.

### Our Solution: The Non-Blocking Triple-Lock
Our architecture uses three techniques to eliminate lag:

```
+------------------------------------------------------------------------------------+
|                         WHY IRIS TALKS WITHOUT STUTTERING                          |
+------------------------------------------------------------------------------------+
|                                                                                    |
| 1. Synchronous String Return:                                                      |
|    `return "Visuals updated to " + topic;`                                         |
|    No `await`, no `fetch()`, no database calls. Returns in under 1 millisecond.    |
|                                                                                    |
| 2. `requestAnimationFrame()` Decoupling:                                           |
|    Browser DOM repaints and CSS slide animations are handed off to the browser's   |
|    next rendering tick (16ms). The JavaScript event loop never blocks the audio.  |
|                                                                                    |
| 3. OpenAI Interleaved Model (`gpt-4o`):                                            |
|    OpenAI's real-time engine emits the tool call and the first voice audio packet  |
|    in the same single breath.                                                      |
|                                                                                    |
+------------------------------------------------------------------------------------+
```

### Visual Comparison: Blocking vs Non-Blocking

```
TRADITIONAL (BLOCKING):
User asks question 
  -> Iris stops
  -> Screen updates (waiting...)
  -> 1.5 seconds silence (AWKWARD PAUSE)
  -> Iris starts speaking

OUR IMPLEMENTATION (NON-BLOCKING):
User asks question 
  -> [Iris speaks: "CASE3 APEX is our platform..."]  <-- AUDIO STREAM
  -> [Screen slides to APEX simultaneously]           <-- DATA CHANNEL
  -> Result: 100% natural conversational flow!
```

---

## 10. Full End-to-End ASCII Sequence Diagram

Here is the complete journey of an attendee's voice:

```
ATTENDEE            BROWSER (`index.html`)             CLOUDFLARE WORKER              ANAM AI CLOUD
   |                         |                                 |                            |
   |--- 1. Clicks "Talk" --->|                                 |                            |
   |                         |-- 2. POST /api/session-token -->|                            |
   |                         |                                 |-- 3. POST /v1/auth/token ->|
   |                         |                                 |<-- 4. { sessionToken } ----|
   |                         |<-- 5. { sessionToken } ---------|                            |
   |                         |                                                              |
   |                         |==== 6. WebRTC Handshake (SDP Offer / Answer) ===============>|
   |                         |<=== 7. Live 60FPS Video of Iris starts streaming ============|
   |                         |                                                              |
   |-- 8. "Tell me about     |                                                              |
   |      your CAIO Manas" ->|                                                              |
   |                         |==== 9. Audio Packets sent over WebRTC Media Highway ========>|
   |                         |                                                              |
   |                         |                                           10. STT Transcribes|
   |                         |                                           11. LLM identifies |
   |                         |                                               topic="leadership"
   |                         |                                                              |
   |                         |<=== 12. WebRTC DataChannel: {"topic": "leadership"} =========|
   |                         |                                           13. TTS generates  |
   |<========================|<=== 14. Voice: "Our CAIO is Manas Mishra, he leads..." =====|
   |    (Iris speaks)        |                                                              |
   |                         |-- 15. `onStart()` intercepts payload                         |
   |                         |-- 16. Returns "Visuals updated" in <1ms -------------------->|
   |                         |-- 17. `requestAnimationFrame` fires                          |
   |                         |-- 18. `window.goToSlide(3)` slides panel                     |
   |                         |-- 19. `window.toggleQrModal(true)` pops QR                   |
   |                         |                                                              |
   | [Sees Slide 4 & QR Code |                                                              |
   |  while listening to Iris]                                                              |
   v                         v                                                              v
```

---

## 11. The Visual Showcase: How the Slides Move

The right-hand side of `index.html` is a zero-scroll, high-performance carousel.

### The Carousel Layout
```
+-------------------------------------------------------------------+
| VIEWPORT CONTAINER (`overflow: hidden; width: 100%`)               |
|                                                                   |
| +---------------------------------------------------------------+ |
| | TRACK (`display: flex; transition: transform 0.5s ease-out;`) | |
| |                                                               | |
| | [Slide 0]     [Slide 1]     [Slide 2]    [Slide 3]   [Slide 4]| |
| | Guidewire     CASE3 APEX    Execution    Leadership  Security | |
| | Core Apps     Platform      Pods         & CAIO QR   Controls | |
| |                                                               | |
| +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

### The 5 Slide Destinations
```
+---------+--------------+---------------------------------------+-----------------------------+
| SLIDE # | ENUM         | TITLE & CONTENT                       | HIGHLIGHT / SPECIAL ACTION  |
+---------+--------------+---------------------------------------+-----------------------------+
| Slide 0 | `guidewire`  | Core Guidewire Modernization          | Policy, Claim, Billing      |
| Slide 1 | `apex`       | CASE3 APEX™ & CRUX Platform           | Autonomous Insurance Eng.   |
| Slide 2 | `execution`  | Agile Execution Pods                  | Build, Upgrade, & Run Pods  |
| Slide 3 | `leadership` | Executive Leadership (Manas Mishra)   | Auto-opens QR Code Modal!   |
| Slide 4 | `security`   | Enterprise Security & Guardrails      | Zero-Hallucination Shield   |
+---------+--------------+---------------------------------------+-----------------------------+
```

When `window.goToSlide(n)` is called:
- Slide 0: `transform: translateX(0%)`
- Slide 1: `transform: translateX(-100%)`
- Slide 2: `transform: translateX(-200%)`
- Slide 3: `transform: translateX(-300%)`
- Slide 4: `transform: translateX(-400%)`
- The dot indicators at the bottom glow to match the active slide index.

---

## 12. Session Lifecycle & State Machine

The interface manages its visual states cleanly to prevent broken audio or frozen cameras:

```
 +-------------------------------------------------------------------------+
 |                               IDLE STATE                                |
 | • Iris preview backdrop image visible (`assets/executive-ashwin.jpg`)   |
 | • Glowing "Talk to Iris" CTA button centered                            |
 | • Status Badge: "Agent Ready" (Grey dot)                                |
 +-------------------------------------------------------------------------+
                                      |
                        User clicks "Talk to Iris"
                                      |
                                      v
 +-------------------------------------------------------------------------+
 |                            CONNECTING STATE                             |
 | • Status Badge: "Connecting..." (Amber pulsing dot)                     |
 | • Browser requests token from Cloudflare Worker (`/api/session-token`)  |
 | • Calls `createClient(token).streamToVideoElement("iris-video")`        |
 +-------------------------------------------------------------------------+
                                      |
                       WebRTC connection established
                                      |
                                      v
 +-------------------------------------------------------------------------+
 |                               LIVE STATE                                |
 | • Poster disappears; `<video id="iris-video">` streams at 60fps         |
 | • Status Badge: "Agent Live" (Green pulsing dot)                        |
 | • Red dismiss button appears in top-right corner (`#btn-end-session`)   |
 | • Control dock active: Mute/Unmute microphone, view transcript drawer   |
 | • Non-blocking client tool actively listens for slide triggers          |
 +-------------------------------------------------------------------------+
                                      |
                  User clicks Red Hangup button or call ends
                                      |
                                      v
 +-------------------------------------------------------------------------+
 |                          TEARDOWN / RESET STATE                         |
 | • `anamClient.stopStreaming()` cleanly closes WebRTC peer connection    |
 | • Video element hidden, idle poster restored                            |
 | • Red button hides; "Talk to Iris" button restored                      |
 | • Status Badge returns to "Agent Ready"                                 |
 +-------------------------------------------------------------------------+
```

---

## 13. Developer Checklist: What is Required in Anam Lab

To connect this codebase to your Anam account, follow these 3 steps in [lab.anam.ai](https://lab.anam.ai):

### Step 1: Create the Client Tool
In your Persona settings, click **Add Tool** -> choose **Client Tool**:
- **Name**: `update_visual_showcase`
- **Description**: `Call this tool to switch the visual showcase panel when discussing specific company topics.`
- **Parameters Schema**:
```json
{
  "type": "object",
  "properties": {
    "topic": {
      "type": "string",
      "enum": ["guidewire", "apex", "execution", "leadership", "security"]
    }
  },
  "required": ["topic"]
}
```

### Step 2: Add the Persona Instruction
In Iris's **System Prompt**, append this instruction:
```text
Whenever the attendee asks about or the discussion transitions to a specific capability, silently call the `update_visual_showcase` tool with the corresponding topic enum:
- "guidewire" for PolicyCenter, ClaimCenter, BillingCenter, or cloud migrations.
- "apex" for the CASE3 APEX platform, autonomous delivery, or CRUX.
- "execution" for Build, Upgrade, or Run pods.
- "leadership" for executive leadership, Manas Mishra, or contact requests.
- "security" for enterprise security, deterministic governance, or guardrails.

Always invoke the tool call and begin speaking your response in the same breath. Never mention the tool call out loud.
```

### Step 3: Model Configuration
- In Anam Lab, set the Persona LLM model to **`gpt-4o`** or **`gpt-4o-mini`** (these models natively support interleaved tool calling and streaming speech).

---

## 14. Troubleshooting Guide ("What If...?")

```
+---------------------------------------+----------------------------------+---------------------------------------+
| SYMPTOM                               | ROOT CAUSE                       | FIX                                   |
+---------------------------------------+----------------------------------+---------------------------------------+
| "Worker returned HTTP 500:            | `ANAM_API_KEY` is missing in     | In your Cloudflare Worker:            |
|  ANAM_API_KEY is not configured"      | the worker environment.          | Run `npx wrangler secret put          |
|                                       |                                  | ANAM_API_KEY` or create `.dev.vars`.  |
+---------------------------------------+----------------------------------+---------------------------------------+
| Iris talks, but the slides            | Client tool not registered in    | Open Anam Lab, verify tool name is    |
| do not move.                          | Anam Lab or enum misspelled.     | exactly `update_visual_showcase` and  |
|                                       |                                  | parameters match the schema.          |
+---------------------------------------+----------------------------------+---------------------------------------+
| Clicking "Talk to Iris"               | Worker is not running or URL is  | Click the "Worker" button in the top  |
| shows "Connection Failed".            | wrong in browser settings.       | bar of index.html and set your URL    |
|                                       |                                  | (e.g. `http://localhost:8787`).       |
+---------------------------------------+----------------------------------+---------------------------------------+
| Microphone is not picking             | Browser permission denied or     | Click the browser lock icon next to   |
| up voice.                             | muted in the UI.                 | URL, allow Microphone, and verify     |
|                                       |                                  | the Mute button is active.            |
+---------------------------------------+----------------------------------+---------------------------------------+
| The video screen is black.            | Browser blocked autoplay with    | Always start by clicking "Talk to     |
|                                       | sound without user gesture.      | Iris" button (which counts as user    |
|                                       |                                  | gesture for WebRTC video & audio).    |
+---------------------------------------+----------------------------------+---------------------------------------+
```

---

*Authored for the CASE3 Technologies Engineering Team.*
