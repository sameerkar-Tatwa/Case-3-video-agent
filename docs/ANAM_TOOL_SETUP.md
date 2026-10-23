# How to Create and Configure the Client Tool in Anam AI

This guide shows you **exactly how to configure the `update_visual_showcase` tool in Anam AI**.

You can do this either via the **Anam Lab Web Dashboard** (Method 1) or via the **Anam REST API** (Method 2).

---

## Method 1: Via the Anam Lab Web UI (Recommended)

### Step 1: Open Your Persona in Anam Lab
1. Go to **[lab.anam.ai](https://lab.anam.ai)** and log in.
2. In the left navigation, click on **Personas**.
3. Select your **Iris** persona (Persona ID: `603598a2-e60a-41fd-a5f3-4347900dd2e5`).

---

### Step 2: Add the Client Tool
1. In the persona editor, find the **Tools** or **Capabilities** section.
2. Click **+ Add tool** (or **New Tool**).
3. **IMPORTANT**: When prompted to choose the tool type, select **`{ } Client tool`** (do **NOT** select *Server Tool / Webhook*).

```
+--------------------------------------------------------------+
| Choose Tool Type:                                            |
|                                                              |
|   [✓] { } Client tool    <-- SELECT THIS ONE                 |
|       Dispatches events directly to the browser WebRTC stream|
|                                                              |
|   [ ] < > Server tool / Webhook                              |
|       Calls an external HTTP URL (do not use for local DOM)  |
+--------------------------------------------------------------+
```

---

### Step 3: Enter the Tool Details

Fill in the fields exactly as follows:

| Field | Value to Enter |
| :--- | :--- |
| **Tool Name** | `update_visual_showcase` |
| **Description** | `Updates the visual presentation panel on the user's screen. Call this immediately when the conversation shifts to Guidewire modules, APEX platform, Execution pods, Leadership/Contact, or Security/Governance. Do not announce you are calling this tool.` |

---

### Step 4: Paste the JSON Parameters Schema

In the **Parameters Schema** (or JSON Schema) input box, paste this exact JSON:

```json
{
  "type": "object",
  "properties": {
    "topic": {
      "type": "string",
      "enum": [
        "guidewire",
        "apex",
        "execution",
        "leadership",
        "security"
      ],
      "description": "The visual slide to display on the showcase palette."
    }
  },
  "required": [
    "topic"
  ]
}
```

Click **Save Tool** or **Add**.

---

### Step 5: Append the Dynamic UI Rules to Iris's System Prompt

In the **System Prompt** / **Instructions** text box for Iris, append this rule block at the bottom:

```text
====================================================================
DYNAMIC UI RULES (STRICT & MANDATORY):
====================================================================
You have a client tool named `update_visual_showcase`. Whenever the conversation shifts to one of the 5 core topics, you must invoke `update_visual_showcase` with the matching topic enum:

- "guidewire": For PolicyCenter, ClaimCenter, BillingCenter, or cloud migrations.
- "apex": For CASE3 APEX platform, autonomous delivery, or CRUX.
- "execution": For Build, Upgrade, or Run execution pods.
- "leadership": For executive leadership, Manas Mishra, or scanning the contact QR code.
- "security": For enterprise security, deterministic governance, or guardrails.

EXECUTION INSTRUCTIONS:
1. Silently invoke `update_visual_showcase` at the very start of your turn.
2. Begin speaking your vocal answer immediately in the same breath.
3. NEVER announce that you are changing slides or calling a tool.
4. Keep spoken responses conversational (2 to 3 sentences maximum).
```

---

### Step 6: Verify LLM Model & Publish
1. Look for the **Model** dropdown in Iris's settings.
2. Set the model to **`gpt-4o`** or **`gpt-4o-mini`**.  
   *(Do NOT choose Groq or Llama models, as they do not support concurrent real-time tool calling and streaming audio).*
3. Click **Save** and then **Publish / Update Persona**.

---

## Method 2: Via the Anam REST API (Programmatic)

If you prefer to configure the tool via curl or a REST client (using your `ANAM_API_KEY`):

### 1. Create the Tool via REST
```bash
curl -X POST "https://api.anam.ai/v1/tools" \
  -H "Authorization: Bearer YOUR_ANAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "update_visual_showcase",
    "description": "Updates the visual presentation panel on the user screen.",
    "type": "client",
    "parameters": {
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
  }'
```

### 2. Attach the Tool to Persona via REST
```bash
curl -X PATCH "https://api.anam.ai/v1/personas/603598a2-e60a-41fd-a5f3-4347900dd2e5" \
  -H "Authorization: Bearer YOUR_ANAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tools": ["update_visual_showcase"]
  }'
```

---

## How to Test That It Works

Once your tool is saved in Anam and you have pasted your real API key in `.dev.vars`:

1. Open **`http://localhost:3000`** in Chrome/Edge.
2. Click **"Talk to Iris"**.
3. Say:
   - *"Tell me about the APEX platform."*  
     $\rightarrow$ Iris speaks and the right screen slides to **CASE3 APEX**.
   - *"How do you handle enterprise security?"*  
     $\rightarrow$ Iris speaks and the right screen slides to **Security & Guardrails**.
   - *"Can I connect with your Chief AI Officer?"*  
     $\rightarrow$ Iris speaks, the right screen slides to **Manas Mishra**, and the **Executive QR Modal** pops up.
