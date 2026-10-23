# CASE3 Technologies — Iris AI Studio & Dynamic Visual Showcase

An enterprise-grade, interactive split-screen digital persona experience built with **Anam AI JS SDK (`@anam-ai/js-sdk`)**, **WebRTC Client Tools**, and a serverless **Cloudflare Worker** backend.

```
+-------------------------------------------------------------------------------------------------------+
|                                  CASE3 IRIS DUAL-PANEL ARCHITECTURE                                   |
+---------------------------------------------------+---------------------------------------------------+
|               LEFT: ANAM AI PERSONA               |             RIGHT: DYNAMIC SHOWCASE               |
|                                                   |                                                   |
| • 60 FPS H.264 WebRTC Stream                     | • Zero-scroll 5-slide visual carousel             |
| • Real-time STT & Natural Audio                   | • Non-blocking slide transitions (<5ms)           |
| • Microphone mute/unmute control                  | • Auto-trigger Executive QR Code modal            |
| • Vivid red top-right hangup button               | • Real-time speech transcript drawer              |
+---------------------------------------------------+---------------------------------------------------+
```

---

## Repository Structure

```
Case-3-video-agent/
├── frontend/                     # Frontend Application (Deployable to Cloudflare Pages)
│   ├── index.html                # Interactive studio UI with dynamic WebRTC client tool
│   ├── assets/                   # Showcase visual slides, cards, & executive photos
│   └── README.md                 # Frontend deployment guide
├── backend/                      # Backend Cloudflare Worker (Deployable to Cloudflare Workers)
│   ├── worker.js                 # Session token minter & Anam API authentication proxy
│   ├── wrangler.toml             # Cloudflare Worker configuration
│   ├── package.json              # Worker scripts (dev, tunnel, deploy)
│   ├── .dev.vars.example         # Sanitized local secrets template
│   └── README.md                 # Backend deployment guide
├── docs/                         # Technical Architecture & Documentation
│   ├── explainer.md              # Complete technical explainer with ASCII diagrams
│   ├── ANAM_TOOL_SETUP.md        # Guide to creating client tools in Anam Lab & REST API
│   ├── prd_case3_iris_dynamic_ui_anam_tool_architecture.md # Original PRD specification
│   └── Agent prompt.md           # Iris persona identity, guardrails, & expo call flow
├── .gitignore                    # Ensures zero credentials or build files are committed
├── package.json                  # Root convenience scripts
└── README.md                     # Master project guide
```

---

## Security & API Key Isolation

> [!IMPORTANT]
> **Zero Credential Leaks**: Your master `ANAM_API_KEY` is strictly held inside Cloudflare's serverless edge environment and never sent to or visible in client browser code. The browser receives only ephemeral, 1-time `sessionToken`s.

- Local secrets live in `.dev.vars` (which is strictly `.gitignore`d).
- Production secrets are stored via Cloudflare Secrets: `npx wrangler secret put ANAM_API_KEY`.

---

## Quickstart (Local Development)

### 1. Start the Backend Worker
```bash
cd backend
npm install
cp .dev.vars.example .dev.vars
# Add your real ANAM_API_KEY into .dev.vars
npm run dev
```
*Worker runs locally on `http://localhost:8787`.*

### 2. Start the Frontend
In another terminal:
```bash
cd frontend
npx serve -l 3000 .
```
*Open `http://localhost:3000` in your browser.*

---

## Cloudflare Deployment

### Deploy Backend (Cloudflare Workers)
```bash
cd backend
npx wrangler secret put ANAM_API_KEY
npm run deploy
```
*Cloudflare outputs your live URL: `https://case3-iris-worker.<subdomain>.workers.dev`.*

### Deploy Frontend (Cloudflare Pages)
1. Go to Cloudflare Dashboard $\rightarrow$ **Workers & Pages** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git**.
2. Select this repository.
3. Set **Build output directory** to: `frontend`.
4. Deploy!
5. In your live site, click the **"Worker"** button in the top navigation bar and enter your Cloudflare Worker URL.

---

## Client Tool Specification

- **Tool Name**: `update_visual_showcase`
- **Type**: `{ } Client tool`
- **Supported Topic Enums**:
  - `guidewire` (PolicyCenter, ClaimCenter, BillingCenter, Guidewire Cloud)
  - `apex` (CASE3 APEX™ & CRUX Platform)
  - `execution` (Build, Upgrade, Run pods)
  - `leadership` (Manas Mishra CAIO Bio + Executive QR Modal)
  - `security` (Enterprise Security, Governance & Guardrails)

Detailed instructions for Anam Lab setup are documented in [`docs/ANAM_TOOL_SETUP.md`](file:///d:/Tatwa%20projects/Case3%20website/docs/ANAM_TOOL_SETUP.md).
