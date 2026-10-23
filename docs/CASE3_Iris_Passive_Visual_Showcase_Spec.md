# CASE3 Iris — Passive Visual Showcase Specification

**Purpose:** A build-ready specification for the visual panel shown beside Iris during expo conversations.

**Agent prompt:** Keep the attached Iris agent prompt unchanged.

**Experience constraint:** The visitor does not click, tap, navigate, expand, or interact with any visual. The panel is presentation-only. It changes automatically when the agent's existing visual-routing tool is called. If there is no reliable screen match, show the default CASE3 overview.

**Primary sources reviewed:**
- Attached `Agent prompt.md` (Iris identity, services, FAQs, conversation flow, lead capture, closing and guardrails)
- [CASE3 website](https://www.case3tech.com/)
- [Build services](https://www.case3tech.com/services/build)
- [Run services](https://www.case3tech.com/services/run)
- [Cloud upgrades](https://www.case3tech.com/services/upgrade/cloud-upgrades)
- [AI Strategy](https://www.case3tech.com/services/advisory-consulting/ai-strategy)
- [Company page](https://www.case3tech.com/company)
- [White Papers](https://www.case3tech.com/white-papers)
- [Current frontend](https://github.com/sameerkar-Tatwa/Case-3-video-agent/blob/main/frontend/index.html)
- [Current visual-tool architecture PRD](https://github.com/sameerkar-Tatwa/Case-3-video-agent/blob/main/docs/prd_case3_iris_dynamic_ui_anam_tool_architecture.md)

---

## 1. Non-negotiable experience rules

1. **Passive visuals only.** No clickable cards, tab bars, navigation buttons, page links, input fields, hover actions, QR scan prompts, or user-operated slide controls. Cards and diagrams are decorative illustrations, not controls.
2. **No new spoken capabilities.** Do not change Iris's system prompt or teach Iris new claims in this implementation. The spoken responses below are taken from, or kept tightly within, the attached prompt.
3. **Speech leads; visuals support.** The visual is not a script to read aloud. Iris should keep the prompt's anti-monologuing rule and allow the visitor to respond after two to three sentences.
4. **Automatic topic changes only.** The display can change when the current visual tool emits a recognised topic. It must never interrupt speech or announce that it is changing screens.
5. **Default fallback is mandatory.** If no exact match is available, intent is uncertain, or the question is outside Iris's approved knowledge, show **Screen 00 — CASE3 Overview**. Do not guess a specialist screen.
6. **No screen-specific claims without support.** Do not put a claim, metric, certification, named person, customer logo, testimonial, or promise on a slide unless its source is verified and its use is approved.
7. **No automatic tour during conversation.** Remove or disable the visible Auto-Tour control and timed auto-advance. The agent's topic selection is the only automatic navigation mechanism.
8. **No modal requiring interaction.** Replace the current executive QR modal with a passive follow-up visual state. Iris can continue gathering details verbally using her existing flow; do not display private contact details or present a visual form.
9. **No implication that the visitor can explore by touching a card.** Use cards as static compositions only. Avoid chevrons, hover styling, underlines, button-like borders, and “click to learn more” copy.
10. **Never infer that an appointment is booked.** The prompt asks for a preferred day for specialist follow-up; it does not say a meeting is confirmed or scheduled.

## 2. Current implementation and routing constraint

The current repository has five tool topics and five slides:

| Existing tool topic | Current purpose | Recommended treatment |
|---|---|---|
| `guidewire` | Guidewire Core Suite | Replace/refine with the Guidewire Platform Map (Screen 01). |
| `apex` | CASE3 APEX platform | Use Screen 05 if APEX and CRUX remain together; use Screen 05 or 06 with a finer topic route if routing is extended. |
| `execution` | Delivery/execution model | Use one combined Build / Upgrade / Run screen if the tool schema remains unchanged. Separate Screens 02–04 require a more precise topic state. |
| `leadership` | Executive contact / QR | Replace with passive Follow-up & Next Steps (Screen 08). Do not automatically open a QR modal. |
| `security` | Security/governance | Replace absolute security claims with Screen 07 — Governance & Human Accountability. |

The current `update_visual_showcase` client tool sends one of these topic values to the browser, and the frontend maps each value to a slide index. **The agent prompt does not need to change** to redesign the five existing slides. However, separately auto-routing Build, Upgrade, Run and CRUX as distinct screens requires a frontend/tool-schema routing update (not a rewrite of the system prompt). If neither the prompt nor the tool schema/description can be changed, keep the current five topic values and combine the relevant content into their parent screens.

### Recommended implementation choice

- **Preferred:** Leave Iris's agent prompt untouched; update the visual panel and, if acceptable, expand the client tool's `topic` enum/description so the same conversation can select specific visual destinations. This is a UI-routing change, not a prompt rewrite.
- **Strictest no-tool-change mode:** Keep only the five existing route values. Build/Upgrade/Run share one Execution screen; APEX/CRUX share one platform screen; unmatched intents go to Overview.

The remainder of this document defines the fuller preferred screen library and identifies which screens work with the current routing and which need a more specific UI topic.

---

## 3. Screen catalogue

### Screen 00 — CASE3 Overview (Default and Fallback)

**Status:** Required. This is the initial screen and the fallback screen for unmatched questions.

**Visual purpose:** Explain CASE3 at a glance without forcing the visitor through a slideshow.

**What to show:**
- CASE3 Technologies brand and a restrained P&C insurance technology headline.
- Three clear service labels: **BUILD · UPGRADE · RUN**.
- One supporting line: experienced people + AI-assisted delivery + accountability for outcomes.
- A small Guidewire expertise label, using only approved partner wording.
- A subtle abstract insurance-platform visual; no made-up dashboard metrics.

**What not to show:**
- Unverified performance metrics.
- A numerical Guidewire-experience badge until the conflicting figures noted in Section 7 are resolved.
- Customer logos, case studies, named executives or certifications not approved for this experience.

**Show for these visitor questions:**
- “What does CASE3 do?”
- “Tell me about your company.”
- “Can you give me an overview?”
- “What kind of work do you do?”
- Any unrelated, unsupported, ambiguous or unmatched question.

**What Iris says — current prompt wording:**

Opening (primary):
> “Welcome to Case3 Technologies. My name is Iris. How can I help you navigate your P&C insurance technology needs today?”

Opening (variation):
> “Hello! Thank you for visiting Case3 Technologies. Are you looking to learn more about our Guidewire expertise or our AI-assisted delivery?”

Intent identification (primary):
> “I can certainly help with that. Are you primarily interested in building a new Guidewire platform, upgrading your current systems, or optimizing your ongoing platform operations?”

Intent identification (variation):
> “I'd be happy to assist. Are you looking for information on our Build, Upgrade, or Run services, or perhaps our CASE3 APEX platform?”

**Routing rule:** This is the fallback for any topic the existing visual tool cannot confidently map. Do not invent an AI Strategy, white-paper, location, executive, compliance, or product-specific answer just because the website has a page about it.

---

### Screen 01 — Guidewire Platform Map

**Status:** Core. Uses existing `guidewire` topic.

**Visual purpose:** Establish the Guidewire areas CASE3 works with and connect them to broad delivery capabilities.

**What to show:**
- Four non-interactive visual tiles: **PolicyCenter**, **ClaimCenter**, **BillingCenter**, **Guidewire Cloud**.
- A thin supporting capability strip: implementation/engineering, product modelling, configuration, integration.
- A restrained architecture motif connecting the platform areas. Do not imply that every possible module or integration has been verified for a specific prospect.

**Show for these visitor questions:**
- “Do you work with Guidewire?”
- “Do you support PolicyCenter / ClaimCenter / BillingCenter?”
- “What Guidewire applications are you familiar with?”
- “Can you help with a new Guidewire implementation?”
- “Can you help us understand a complex legacy estate?”
- “What P&C applications do you work with?”

**What Iris says — current prompt wording:**

For product expertise:
> “Case3 provides Guidewire implementation and engineering, product modelling, configuration, integration, and delivery execution.”

For new implementations:
> “Yes, Case3 assists with platform implementation, product modelling, and cloud integration aligned with your business outcomes.”

For complex legacy systems:
> “Yes, Case3 helps build a clearer understanding of systems, dependencies, and change impacts for complex legacy environments.”

For discovery, Iris may ask:
> “What P&C insurance lines or specific Guidewire applications—such as PolicyCenter, ClaimCenter, or BillingCenter—are you currently working with?”

**Accuracy note:** The prompt names PolicyCenter, ClaimCenter and BillingCenter in the discovery flow. Guidewire Cloud and further detailed capability tiles are website-inspired visual context; do not make the slide imply an unapproved guarantee or a prospect-specific technical fit.

---

### Screen 02 — Build & Advisory

**Status:** Recommended. Distinct auto-routing needs a more specific UI topic; otherwise include it within the existing `execution` screen.

**Visual purpose:** Illustrate the stages of a new platform implementation and the associated advisory work.

**What to show:**
A simple static left-to-right workflow:

`DISCOVERY & INCEPTION → PRODUCT MODELLING → CONFIGURATION → INTEGRATION → DELIVERY`

Supporting labels can include APD-led product modelling, architecture assessment, and programme planning. Keep these as static informational labels, not interactive buttons.

**Show for these visitor questions:**
- “We need a new Guidewire implementation.”
- “Can you help us build a new platform?”
- “Can you assist with product modelling?”
- “Can you help with architecture assessments or programme planning?”
- “We are launching a new product or line of business.”

**What Iris says — current prompt wording:**
> “Yes, Case3 assists with platform implementation, product modelling, and cloud integration aligned with your business outcomes.”

If advisory is the main interest, use the approved service description:
> “Case3 also offers insurance and technology advisory, architecture assessments, and programme planning.”

**Visual boundary:** The website discusses further Build capabilities, including rating/pricing, data migration, testing and deployment considerations. These may appear as secondary labels only if verified against the current service page; the existing agent prompt does not provide enough detail for Iris to explain each one at length. If asked for details not covered by the prompt, route to Overview and use the existing intent-discovery flow.

---

### Screen 03 — Upgrade Pathway

**Status:** Recommended. Distinct auto-routing needs a more specific UI topic; otherwise include it within the existing `execution` screen.

**Visual purpose:** Show a disciplined upgrade lifecycle without promising a risk-free or defect-free outcome.

**What to show:**

`UPGRADE PLANNING → IMPACT ASSESSMENT → REMEDIATION → REGRESSION TESTING → CUTOVER SUPPORT`

Use a clean process line with one highlighted stage at a time only if the UI can do this automatically; do not animate it as a user-controlled stepper. Avoid percentages, success rates or countdowns unless approved evidence supports them.

**Show for these visitor questions:**
- “How do you manage Guidewire upgrade risks?”
- “We are planning an upgrade.”
- “How do you deal with customizations during an upgrade?”
- “How do you approach regression testing?”
- “Can you help with the transition or cutover?”

**What Iris says — current prompt wording:**

FAQ response:
> “Case3 conducts thorough impact assessments and supports disciplined remediation, testing, and transition to ensure stability.”

Product-discussion example:
> “For platform upgrades, Case3 assesses the change impact and supports disciplined remediation, regression testing, and transition, combining deep Guidewire expertise with AI-assisted execution.”

**Accuracy boundary:** Do not say “zero defects,” “zero risk,” “guaranteed savings,” or promise a guaranteed upgrade outcome. The prompt expressly disallows these kinds of guarantees.

---

### Screen 04 — Run & Platform Operations

**Status:** Recommended. Distinct auto-routing needs a more specific UI topic; otherwise include it within the existing `execution` screen.

**Visual purpose:** Explain ongoing platform support and optimization.

**What to show:**
Four or five static visual zones:
- Platform Operations & Support
- Incident Resolution
- Observability / Monitoring
- Governance
- Continuous Optimization

A circular operations loop is suitable, but avoid depicting a live production dashboard or invented live statistics.

**Show for these visitor questions:**
- “Can you help optimize our platform operations?”
- “We have recurring incidents.”
- “Can you help improve incident handling?”
- “Do you provide ongoing Guidewire support?”
- “How do you approach observability and continuous optimization?”

**What Iris says — current prompt wording:**
> “Yes, Case3 focuses on improving incident handling, observability, and ongoing platform optimisation to reduce operational friction.”

Supporting prompt language:
> “Offerings include platform operations, support, incident resolution, observability, governance, and continuous optimization.”

**Accuracy boundary:** Website pages mention additional service detail such as monitoring, transition services and tiered support. Do not present a specific SLA, exact response time or guaranteed incident-resolution time unless it is approved for Iris's knowledge base.

---

### Screen 05 — CASE3 APEX: Agentic Execution Platform

**Status:** Core. Uses existing `apex` topic.

**Visual purpose:** Make APEX understandable as a platform that coordinates agentic capabilities across engineering work while keeping human accountability visible.

**What to show:**
- Central label: **CASE3 APEX**.
- Three connected capability areas: **BUILD**, **UPGRADE**, **RUN**.
- A supporting layer for enterprise context and engineering tasks.
- A clear **Expert Review / Human Accountability** layer.
- Use arrows to explain relationships, not to imply unrestricted autonomous control.

**Show for these visitor questions:**
- “What is CASE3 APEX?”
- “What do you mean by agentic Build or Upgrade?”
- “How does APEX help an engineering team?”
- “Are your agents completely autonomous?”
- “How do AI agents fit into Build, Upgrade and Run?”

**What Iris says — current prompt wording:**

For Agentic Build / Upgrade:
> “It is Case3's approach to applying agentic capabilities to suitable engineering and upgrade activities, always maintaining human oversight and accountability.”

For how APEX helps:
> “APEX helps teams understand complex estates, assess change, and reduce repetitive effort while ensuring human accountability.”

For the broader platform:
> “CASE3 APEX is the Autonomous Platform for Enterprise execution, which supports delivery while keeping people accountable for decisions and outcomes.”

**Accuracy boundary:** Do not imply full autonomy, autonomous approval of high-impact decisions, or that the platform guarantees a particular result.

---

### Screen 06 — CRUX: Repository of Understanding

**Status:** Optional dedicated screen. With the current five-topic tool schema, this must remain part of Screen 05 (APEX) unless the UI routing state is made more specific.

**Visual purpose:** Explain system understanding and architecture evidence as distinct from APEX's orchestration role.

**What to show:**
A static conceptual map containing:
- Repositories / applications
- Configuration and dependencies
- Integrations
- Architecture evidence
- Complexity and change impact

Use an illustrative dependency graph, not a fabricated screenshot of a customer's repository. Label it clearly as a conceptual illustration.

**Show for these visitor questions:**
- “What is CRUX?”
- “How do you understand a complex legacy estate?”
- “Can you identify dependencies and change impact?”
- “How does your approach support architecture analysis?”

**What Iris says — current prompt wording:**
> “CRUX is CASE3's Repository of Understanding excellence, designed to support system understanding, complexity analysis, and architecture evidence.”

For legacy estates, Iris can also use:
> “Case3 helps build a clearer understanding of systems, dependencies, and change impacts for complex legacy environments.”

**Fallback rule:** If the visitor asks for a particular scan method, supported language, repository connector, technical integration or exact CRUX output that is not described in the existing prompt, do not invent an answer. Return to Screen 00 and continue with the current intent-discovery or follow-up flow.

---

### Screen 07 — Governance & Human Accountability

**Status:** Core. Uses existing `security` topic.

**Visual purpose:** Communicate bounded, reviewable delivery principles without making absolute security or compliance promises.

**What to show:**
A simple static chain:

`DEFINED SCOPE → AI-ASSISTED WORK → EXPERT REVIEW → APPROVED DECISION → TRACEABLE EVIDENCE`

Supporting themes: human oversight, governance, review and accountability. Use neutral wording rather than red-alert styling or “zero” guarantees.

**Show for these visitor questions:**
- “How much autonomy do the agents have?”
- “Who remains accountable for decisions?”
- “Is there human review?”
- “How do you keep AI-assisted engineering governed?”
- “How do you keep the work reviewable?”

**What Iris says — current prompt wording:**
> “It is Case3's approach to applying agentic capabilities to suitable engineering and upgrade activities, always maintaining human oversight and accountability.”

Or:
> “APEX helps teams understand complex estates, assess change, and reduce repetitive effort while ensuring human accountability.”

**Do not show or say unless separately approved:** “Zero-Hallucination Policy,” “Zero Data Leakage,” “fully secure,” “SOC 2 compliant,” “ISO certified,” “customer data never trains public models,” or any specific controls that do not appear in Iris's approved prompt. Those statements are not established by the attached prompt.

---

### Screen 08 — Follow-up & Next Steps

**Status:** Recommended replacement for the current leadership/QR screen. Uses existing `leadership` topic when the visitor asks for a specialist or follow-up.

**Visual purpose:** Reinforce that Iris can arrange a follow-up with a CASE3 delivery leader or executive, without pretending the meeting is booked.

**What to show:**
- A calm “Follow-up with a CASE3 specialist” heading.
- A passive three-stage illustration: **Contact Details → Confirm Details → Preferred Follow-up Day**.
- No form controls, QR modal, clickable LinkedIn link, named executive profile or displayed phone/email values.

**Show for these visitor statements:**
- “Can someone from CASE3 follow up?”
- “I'd like to speak to a delivery leader.”
- “Can we arrange a follow-up conversation?”
- Any clear acceptance of Iris's offer to have a specialist contact them.

**What Iris says — current prompt wording:**

Name and organization:
> “To ensure we can provide the best guidance, may I have your name and the insurance organization you represent?”

Phone:
> “Thank you. Could I please get the best phone number to reach you at?”

Phone confirmation:
> “Got it, so that number is [repeat phone number]. Did I get that right?”

Email:
> “And what is your email address? Since emails can be tricky, could you please spell it out letter by letter?”

Email confirmation:
> “Thank you. Just to make sure I have it perfectly, that's [repeat email address]. Is that correct?”

Preferred day:
> “Excellent. Is there a specific day next week that works best for a Case3 specialist to follow up with you?”

Closing:
> “Thank you for stopping by Case3 Technologies. I've recorded your interest. One of our leaders will contact you shortly to discuss how we can bring precision to your complex technology programmes.”

**Visual/privacy boundary:** Do not mirror the visitor's phone number or email on the screen. Iris can repeat those details verbally, as the prompt directs, but the public-facing presentation should not expose personal details to passers-by.

---

## 4. Optional website-inspired screens — do not auto-route without an approved mapping

The following content exists on the public website, but the attached Iris prompt does **not** provide a dedicated answer for each topic. These can be implemented as passive visual destinations only if a routing mechanism is added. Until then, questions in these areas should use Screen 00 — CASE3 Overview.

### Optional A — P&C Insurance Lifecycle

**Website basis:** CASE3 homepage and insurance-domain messaging.

**Visual:** A simple non-interactive overview of policy, claims, billing and associated insurance operations. Keep it as an illustrative domain map.

**Possible visitor questions:**
- “What parts of P&C insurance do you work in?”
- “Do you understand policy and claims operations?”

**Current-prompt speech:** Use the existing discovery question:
> “What P&C insurance lines or specific Guidewire applications—such as PolicyCenter, ClaimCenter, or BillingCenter—are you currently working with?”

**Routing:** If the existing tool only provides `guidewire`, use Screen 01 instead. If the request asks for detailed underwriting or actuarial expertise not covered by the prompt, use Screen 00.

### Optional B — Integration & Data Landscape

**Website basis:** [Build services](https://www.case3tech.com/services/build) describes platform architecture and integrations, rating/pricing, data migration/conversion and quality engineering.

**Visual:** A conceptual diagram linking core insurance platforms to rating, payment, documents and downstream systems. Add a separate migration/validation strip only if it remains legible.

**Possible visitor questions:**
- “Can you help with platform integration?”
- “What about a complex legacy estate?”
- “Do you deal with data migration?”

**Current-prompt speech:** For integration, use the existing Build answer about implementation, product modelling and cloud integration. For legacy complexity, use the existing answer about systems, dependencies and change impacts.

**Routing:** Integration may map to Screen 01 or Screen 02; if neither is an exact supported match, use Screen 00. Do not use the visual to make Iris claim an unlisted connector, migration method or technology.

### Optional C — AI Strategy & Readiness

**Website basis:** [AI Strategy](https://www.case3tech.com/services/advisory-consulting/ai-strategy) discusses readiness and maturity assessments, business cases, coaching/adoption and rollout planning.

**Visual:** A static lifecycle labelled Assess → Prioritize → Plan → Pilot → Scale. Do not display ROI numbers or maturity scores.

**Possible visitor questions:**
- “Can you assess our AI readiness?”
- “Can you build an AI business case?”
- “Do you help with AI adoption?”

**Current-prompt limit:** The prompt supports general insurance/technology advisory, architecture assessments and programme planning, but does not give Iris specific AI Strategy, maturity-assessment or ROI-calculation answers.

**Routing:** Use Screen 00 by default. Iris can ask the existing intent-discovery question or collect interest for follow-up. Do not have her promise an AI maturity assessment or calculate an ROI.

### Optional D — Company & Team

**Website basis:** [Company page](https://www.case3tech.com/company).

**Visual:** CASE3 identity, company principles and a neutral team montage only if the images/names are current and approved. It should not present a particular leader as the default contact.

**Possible visitor questions:**
- “Who is CASE3?”
- “Can I talk to a senior person?”
- “Who would follow up?”

**Current-prompt speech:** Use the company overview and, for a requested follow-up, the existing lead-capture wording. The prompt authorizes a follow-up with a delivery leader or executive but does not identify a specific person.

**Routing:** General company questions → Screen 00. Follow-up request → Screen 08. If asked to name a leader, do not invent or assume the point of contact.

### Optional E — White Papers & Resources

**Website basis:** [White Papers](https://www.case3tech.com/white-papers).

**Visual:** A static resource-library composition with verified titles such as “Run Services - Intelligent automation” and “Forecasting Business Values with AI/Models.” No clickable “Request your copy” button in the visual panel.

**Possible visitor questions:**
- “Do you have a white paper I can read?”
- “Can someone send me more information?”

**Current-prompt limit:** The attached prompt contains no white-paper catalogue or distribution instructions.

**Routing:** Screen 00 unless the visitor clearly requests follow-up, in which case Screen 08. Do not claim Iris has sent a paper or can fulfil a request unless that capability exists outside the current prompt.

---

## 5. Question-to-screen routing matrix

Use this table as the mapping reference for the visual routing layer. Questions are examples of semantic intent, not brittle exact phrase triggers.

| Visitor's question / intent | Target screen | Existing topic compatibility | Agent response source |
|---|---|---|---|
| “What does CASE3 do?” | 00 Overview | Default/fallback; no new topic required | Opening / intent-identification lines |
| “Tell me about the company.” | 00 Overview | Default/fallback | Company overview in prompt |
| “Do you work with PolicyCenter, ClaimCenter or BillingCenter?” | 01 Guidewire | `guidewire` | Guidewire overview / discovery prompt |
| “Can you help with a new implementation?” | 02 Build | `execution` only; distinct screen needs finer routing | Build FAQ |
| “Can you help with product modelling / cloud integration?” | 02 Build | `execution` only; distinct screen needs finer routing | Build FAQ |
| “How do you manage upgrade risks?” | 03 Upgrade | `execution` only; distinct screen needs finer routing | Upgrade FAQ and example script |
| “What about remediation, testing or cutover?” | 03 Upgrade | `execution` only; distinct screen needs finer routing | Upgrade example script |
| “Can you improve our platform operations?” | 04 Run | `execution` only; distinct screen needs finer routing | Run FAQ |
| “What is CASE3 APEX?” | 05 APEX | `apex` | APEX overview |
| “What is Agentic Build or Agentic Upgrade?” | 05 APEX | `apex` | Agentic Build/Upgrade FAQ |
| “What is CRUX?” | 06 CRUX, or 05 APEX if no finer route | `apex` today | CRUX FAQ |
| “How do you manage human accountability?” | 07 Governance | `security` | APEX / human-accountability FAQ |
| “Can someone follow up with me?” | 08 Follow-up | `leadership` today | Existing lead-capture flow |
| “Can you show me AI readiness / ROI / a white paper?” | 00 Overview unless a new route is approved | No reliable current topic | Existing intent-discovery or follow-up; no invented detail |
| Anything ambiguous, unrelated or unsupported | 00 Overview | Fallback | Existing intent-identification line; ask what area is relevant |

### Fallback rule (must be implemented)

```text
IF the spoken question has a clear match to a supported visual topic:
    show the corresponding passive visual
ELSE:
    show Screen 00 — CASE3 Overview

Never guess a specialised screen solely because one keyword appears.
Never change visuals because of a broad or unrelated word if the intent is unclear.
Never let the visual provide facts absent from the approved agent knowledge.
```

---

## 6. Visual design and motion requirements

### Layout
- Retain the current split-screen experience: Iris on one side, visual showcase on the other.
- Prefer a zero-scroll design that fits within the available panel.
- One dominant message per screen, three to five visual elements at most.
- Keep headline and labels readable at expo viewing distance.
- Avoid tiny footnotes, dense paragraphs and crowded dashboards.

### Visual style
- Modern enterprise P&C insurance technology aesthetic.
- Dark navy/charcoal foundation, restrained blue and teal accents, high-contrast typography.
- Prefer architecture diagrams, process strips, platform maps and conceptual diagrams over generic stock-photo mosaics.
- Use real CASE3 website brand assets where permitted.
- Do not use carrier/warship/military-inspired design motifs. The prompt explicitly says not to imply naval affiliation or military certification.

### Motion
- Crossfade or short slide transition only when the destination changes.
- Never use an animated progress sequence that suggests a real task is executing.
- No blinking green “secure,” “live,” “approved,” or “success” badges unless those states are real and verified.
- Do not transition on every utterance; switch only when the dominant intent changes.
- Avoid changing screens midway through Iris's sentence if timing data is available; otherwise keep the transition short and non-blocking.

### Interaction removal checklist
- Remove slide dots and previous/next buttons.
- Remove Auto-Tour and any timer that changes the current screen.
- Remove all clickable cards/tiles and hover states.
- Remove the QR modal and automatic QR popup.
- Remove pointer cursors from decorative elements.
- Keep transcript/session controls outside the showcase; they are not part of the passive screen library.

---

## 7. Claims and source-of-truth checks

The agent prompt and live website are not perfectly aligned on all public-facing details. Because the system prompt must remain unchanged, avoid adding unresolved numerical claims to the new visuals.

### Guidewire experience statistics — unresolved
- Attached Iris prompt: **over 200 years of combined Guidewire experience**.
- Current Company page: **100+ years** among founders and core team.
- Current frontend header also displays **200+ years**; a slide includes other experience labels.

These figures may describe different populations, but their definitions are not reconciled in the materials reviewed. **Do not put a numerical experience figure on the visual screen until the owner confirms the source of truth.** Because the system prompt is to remain unchanged, be aware Iris may still use the figure present in her prompt when asked. This document cannot resolve that prompt-vs-website discrepancy without changing or approving the knowledge source.

### Claims to remove from visual copy unless separately substantiated and approved
- “Zero-Hallucination Policy”
- “Zero Data Leakage”
- “fully autonomous” / “fully autonomous operation”
- Guaranteed savings, guaranteed defect-free delivery or guaranteed results
- Certifications or compliance badges not explicitly approved for this experience
- Unverified customer names, testimonials, partner logos or case-study outcomes
- Specific executive identity/contact routing not established by the attached prompt

The attached prompt specifically prohibits invented customer names, testimonials, partnerships, certifications, awards and performance statistics; it also prohibits guarantees of zero defects, guaranteed savings or fully autonomous operation.

### General rule for numeric values
If a metric does not have a named source, clear definition, approved scope and current validation, omit it. A passive visual still makes a factual claim even if Iris never reads it aloud.

---

## 8. Recommended delivery plan

### Phase 1 — Improve existing screens without changing the agent prompt
1. Make Screen 00 the default at page load and the fallback for unmapped intents.
2. Rebuild `guidewire`, `apex`, `execution`, `leadership` and `security` as passive visual destinations.
3. Replace the leadership/QR behaviour with a passive Follow-up & Next Steps visual.
4. Remove interactive slide controls, auto-tour, hover actions and absolute security copy.
5. Keep Build, Upgrade and Run together on the existing Execution screen if the client tool schema must remain unchanged.
6. Keep APEX and CRUX together on the existing APEX screen if the client tool schema must remain unchanged.

### Phase 2 — Add more precise automatic visual destinations (still no system-prompt rewrite)
1. Add a finer UI routing state for Build, Upgrade and Run.
2. Add a separate CRUX destination.
3. Keep screen updates driven by the existing visual tool mechanism and semantic intent. This requires updating the client tool schema/description and frontend routing map, but not rewriting Iris's core system prompt.
4. Keep optional website screens (P&C lifecycle, Integration/Data, AI Strategy, Company/Team and White Papers) disabled for automatic routing until their spoken support is approved. Unmatched questions continue to fall back to Screen 00.

### Acceptance criteria
- [ ] On first load, Screen 00 is visible.
- [ ] Guidewire questions reliably show Screen 01.
- [ ] Build/Upgrade/Run use a combined Execution screen when no finer routing exists; they show their distinct screens only when finer routing is configured.
- [ ] APEX and CRUX use the combined APEX screen unless CRUX has a dedicated route.
- [ ] Governance questions show Screen 07, without unsupported security guarantees.
- [ ] Follow-up intent shows Screen 08 without opening a QR modal or input form.
- [ ] Unsupported or ambiguous questions return to Screen 00.
- [ ] No visitor-facing visual requires interaction.
- [ ] No automatic tour changes the screen during a live conversation.
- [ ] Visual labels do not contradict the spoken answer or include unsupported claims.
- [ ] Iris's current prompt, identity, guardrails and spoken call flow remain unchanged.

---

## 9. Compact developer routing reference

### Preferred fine-grained topic values

These are frontend/tool-schema routing values, not new spoken instructions. Use only if the client tool schema is permitted to change while leaving the agent prompt untouched.

```json
{
  "topic": "overview | guidewire | build | upgrade | run | apex | crux | security | leadership"
}
```

Mapping:

| Topic value | Screen |
|---|---|
| `overview` | 00 Overview |
| `guidewire` | 01 Guidewire Platform Map |
| `build` | 02 Build & Advisory |
| `upgrade` | 03 Upgrade Pathway |
| `run` | 04 Run & Platform Operations |
| `apex` | 05 CASE3 APEX |
| `crux` | 06 CRUX |
| `security` | 07 Governance & Human Accountability |
| `leadership` | 08 Follow-up & Next Steps |

If the current enum must remain unchanged, keep `execution` and route it to a single combined Build/Upgrade/Run display, and route `apex` to a combined APEX/CRUX display. The frontend should use Screen 00 when no recognised topic is received.

---

## 10. Final recommendation

Build **eight core passive destinations plus one Overview fallback**: Overview, Guidewire, Build, Upgrade, Run, APEX, CRUX, Governance, and Follow-up. That is enough to make the right panel feel relevant to the conversation without overwhelming an expo visitor. Add the optional website-inspired screens only if a future requirement justifies a dedicated visual route; otherwise keep them out of the automatic rotation and fall back to Overview.

Most importantly: the visitor never operates the screen. Iris's conversation selects the visual, the screen illustrates only what is approved, and every unmatched question returns to the default CASE3 Overview.
