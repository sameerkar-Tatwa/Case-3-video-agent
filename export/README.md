# CASE3 Technologies - Interactive AI Video Agent App

A high-performance, single-viewport split-screen web application featuring:
- **Left Panel**: In-container real-time video stream embedded via Anam AI Web Component (`<anam-agent>`) with custom controls (vibrant red close button, mute toggle, interactive transcript drawer).
- **Right Panel**: Zero-scroll 4-slide dynamic visual showcase (Guidewire Core Suite, CASE3 APEX™ Platform, 3 Dedicated Execution Models, and Executive Leadership Contact) with rich 3D isometric background graphics.

---

## Quick Setup (Zero Credentials Leaked)

This export package is fully sanitized and contains **no hardcoded credentials or private persona IDs**.

### Step 1: Set Your Anam Agent ID
1. Open [`index.html`](index.html).
2. Locate the `<anam-agent>` component (line 133):
   ```html
   <anam-agent 
       id="iris-agent"
       agent-id="YOUR_ANAM_AGENT_ID" 
       api-base-url="https://lab.anam.ai"
       layout="inline">
   </anam-agent>
   ```
3. Replace `YOUR_ANAM_AGENT_ID` with your Anam persona ID from [lab.anam.ai](https://lab.anam.ai).

### Step 2: Configure Domain Allowlisting in Anam Lab
1. Go to **Anam Lab** > **Personas** > Select your persona.
2. Navigate to **Embed** > **Widget**.
3. Under **Allowed Domains / Origins**, toggle on **"Allow everywhere"** (or add `http://localhost:8000` / your production domain).
4. Click **Publish**.

### Step 3: Run the Application Locally
Browsers require an HTTP/HTTPS protocol for WebRTC and microphone permissions (direct `file:///` URLs block camera/mic). Run with any local HTTP server:

**Using Python:**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Or using Node (npx):**
```bash
npx serve .
```

---

## File Structure
```
export/
├── index.html        # Complete split-screen application (sanitized, zero-scroll)
├── assets/           # All background visual artwork and executive badge
│   ├── apex-platform.jpg
│   ├── bg-billing.jpg
│   ├── bg-claims.jpg
│   ├── bg-cloud.jpg
│   ├── bg-policy.jpg
│   ├── executive-ashwin.jpg
│   ├── guidewire-core.jpg
│   ├── manas-mishra-id.jpg
│   └── solutions-pipeline.jpg
├── .gitignore        # Standard ignore rules
└── README.md         # Deployment & configuration instructions
```
