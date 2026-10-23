# CASE3 Iris — Backend Token Minter & Tool Backend (Cloudflare Worker)

This directory contains the serverless Cloudflare Worker powering the **CASE3 Iris Dynamic UI**.

---

## What It Does
1. **Security Isolation**: Safely holds `ANAM_API_KEY` on Cloudflare's edge so master API keys are never exposed in browser source code.
2. **Ephemeral Token Minting**: Accepts `POST /api/session-token` requests and returns short-lived, single-session WebRTC tokens to the frontend.
3. **Health Check**: Provides `GET /health` for uptime monitoring and connectivity testing.

---

## Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Secrets**:
   Copy `.dev.vars.example` to `.dev.vars`:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   Open `.dev.vars` and add your real Anam key:
   ```properties
   ANAM_API_KEY="your_anam_api_key_here"
   ANAM_PERSONA_ID="603598a2-e60a-41fd-a5f3-4347900dd2e5"
   ```

3. **Start Local Worker**:
   ```bash
   npm run dev
   ```
   The worker will start on `http://localhost:8787`.

4. **Start with Cloudflare Quick Tunnel (Optional)**:
   ```bash
   npm run dev:tunnel
   ```

---

## Deploying to Cloudflare (Production)

1. **Add Your Secret to Cloudflare**:
   ```bash
   npx wrangler secret put ANAM_API_KEY
   ```
   *(Paste your Anam API key when prompted)*

2. **Deploy Worker**:
   ```bash
   npm run deploy
   ```

3. **Copy the Deployed Worker URL**:
   Cloudflare outputs your live URL (e.g. `https://case3-iris-worker.<subdomain>.workers.dev`).
   Enter this URL in the frontend's **Worker Settings** modal.
