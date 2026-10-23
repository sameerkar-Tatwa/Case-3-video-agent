# CASE3 Iris — Frontend Interactive Studio & Dynamic UI

This directory contains the zero-scroll, split-screen interactive AI studio for **CASE3 Technologies**.

---

## Features
- **Left Panel**: Real-time 60fps WebRTC video stream of Anam AI persona "Iris" with native controls (Red hangup button, mic mute, live transcript feed).
- **Right Panel**: Zero-scroll dynamic visual showcase featuring 5 slides:
  1. `guidewire` (Core Insurance Apps: Policy, Claim, Billing, Cloud)
  2. `apex` (CASE3 APEX™ & CRUX Platform)
  3. `execution` (Build, Upgrade, Run Pods)
  4. `leadership` (Manas Mishra CAIO Bio & Executive QR Code Popup)
  5. `security` (Enterprise Security, Governance & Zero-Hallucination Shield)
- **Non-Blocking Client Tool (`update_visual_showcase`)**: Transitions slides in <5ms over WebRTC Data Channel without interrupting Iris's speech.
- **Worker Configuration Modal**: Allows switching between local worker (`http://localhost:8787`) and production Cloudflare Worker URL.

---

## Local Development

Run any static HTTP server from this directory:
```bash
npx serve -l 3000 .
```
Or from root:
```bash
npm run dev:frontend
```

Open `http://localhost:3000` in your browser.

---

## Hosting on Cloudflare Pages

1. In Cloudflare Dashboard, go to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Select repository: `Case-3-video-agent`.
3. In **Build settings**:
   - **Framework preset**: None
   - **Build command**: *(leave blank)*
   - **Build output directory**: `frontend`
4. Click **Save and Deploy**.
5. Once deployed, open your live Pages URL, click the **"Worker"** button in the top bar, and enter your live Cloudflare Worker backend URL.
