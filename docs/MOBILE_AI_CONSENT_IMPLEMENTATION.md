# Mobile AI Data Processing Consent Implementation

This document is for the React Native mobile agent. It defines the required
client behavior for Apple App Review Guidelines 5.1.1(i) and 5.1.2(i).

> Backend dependency: the consent endpoints and error codes below must be
> deployed before this mobile flow is released. Until then, do not simulate a
> successful consent locally and do not make any AI or ChatKit request without
> confirmed server-side consent.

## Goal

Before GossipAI sends any personal data to **OpenAI**, the user must see a
clear explanation and actively choose whether to allow that processing. The
choice must be recorded by the backend and enforced by the backend for every
AI request.

This is a dedicated AI data-processing choice. It is not a cookie notice,
Terms of Service acceptance, or a link-only Privacy Policy acknowledgement.

## Consent screen

### When to show it

Show this screen immediately before the user's first attempt to use any AI
feature, including:

- starting a new AI chat;
- sending an AI message;
- uploading an image for AI analysis;
- creating or restoring a ChatKit/OpenAI client session.

Show it again whenever the backend reports that the user has not consented or
that the accepted policy version is outdated. This applies to all existing
accounts too; do not grandfather old users in.

### Required English copy

Use the following copy verbatim unless the product/legal owner approves a new
policy version:

**Title**

`Before you use AI`

**Body**

`GossipAI uses OpenAI to generate AI advice. If you choose "Allow AI data processing", GossipAI will send the information needed for your request to OpenAI: your message; any context or chat log you add; recent conversation messages and saved conversation summaries or memory; selected preferences such as language, relationship, goal, tone, and optional gender information; a technical GossipAI account identifier; and any image you choose to attach.`

`OpenAI processes this information to generate your AI response. Do not include information you do not want processed by OpenAI. You can withdraw this permission at any time in Settings; AI features will stop working until you allow processing again.`

**Privacy link**

`Read the Privacy Policy`

Open the deployed `https://gossip-ai.site/privacy` page in the system browser
or the app's approved in-app browser.

**Actions**

- Primary, explicit action: `Allow AI data processing`
- Secondary action: `Not now`

Do not preselect consent. Do not make `Not now` difficult to find. Do not send
any OpenAI/ChatKit request until the user taps the primary action and the
backend confirms it.

### Behavior

| User action | Required result |
| --- | --- |
| `Allow AI data processing` | Call the grant endpoint. Proceed only after a successful response showing active consent. Resume the original AI action once. |
| `Not now` or dismiss | Return to the prior screen; do not create a ChatKit session, send an AI message, upload an image, or queue a retry. Show a neutral state explaining that AI requires permission. |
| Network/server failure | Keep AI blocked. Show a retry action; never assume consent from an earlier local value. |
| Backend says consent is outdated | Show this screen with the currently required policy version and require a fresh affirmative action. |

## Backend contract

All endpoints require the normal authenticated bearer token. These are target
contracts to integrate once the backend release is deployed.

### Read current consent

`GET /api/auth/ai-consent`

Expected successful response:

```json
{
  "data": {
    "status": "granted",
    "requiredPolicyVersion": "2026-07-15",
    "acceptedPolicyVersion": "2026-07-15",
    "grantedAt": "2026-07-15T12:34:56.000Z"
  }
}
```

Treat consent as active only when all three conditions are true:

1. `status` is `granted`.
2. `acceptedPolicyVersion` equals `requiredPolicyVersion`.
3. The request completed successfully with the current authenticated user.

Any other status, a missing value, a failed request, or an unauthenticated
session means AI is unavailable.

### Grant or revoke consent

`PUT /api/auth/ai-consent`

Grant request:

```json
{
  "action": "grant",
  "policyVersion": "2026-07-15"
}
```

Revoke request:

```json
{
  "action": "revoke",
  "policyVersion": "2026-07-15"
}
```

The app must use the `requiredPolicyVersion` returned by `GET`, not a
hard-coded version. After either operation, replace any locally cached consent
state with the response returned by the server.

### Consent errors from AI endpoints

AI and ChatKit endpoints may return these errors:

```json
{
  "error": {
    "code": "AI_CONSENT_REQUIRED",
    "message": "AI data-processing consent is required."
  }
}
```

```json
{
  "error": {
    "code": "AI_CONSENT_VERSION_OUTDATED",
    "message": "The AI data-processing policy must be accepted again."
  }
}
```

On either error:

1. Stop the current AI request and do not automatically retry it.
2. Discard any ChatKit/OpenAI client secret that was prepared for that request.
3. Refresh consent state from `GET /api/auth/ai-consent`.
4. Present the consent screen.
5. Retry only if the user explicitly grants the currently required version.

## Required mobile integration

### Before every AI entry point

Centralize this in one asynchronous guard, for example
`ensureAiDataProcessingConsent()`. All AI entry points must call it before
making a network request:

- `POST /api/chatkit/sessions`;
- `POST /api/chatkit/messages`;
- `POST /api/conversations/:id/messages`;
- any future endpoint that can send text, conversation context, metadata, or
  an image to OpenAI.

The guard must use the backend as the source of truth. A locally cached value
may improve rendering, but cannot authorize an AI request by itself.

### ChatKit sessions

Never request, retain, or reuse a `clientSecret` until active consent is
confirmed. A ChatKit session creation request itself transmits a technical user
identifier to OpenAI, so it is covered by the consent requirement.

On app launch, token refresh, conversation restore, or resume from background,
validate consent before restoring an AI session. Do not silently recreate a
session if the status is unknown, revoked, or outdated.

### Settings: withdraw permission

Add a clearly labelled settings row:

- Label: `AI data processing`
- Active state: `Allowed`
- Inactive state: `Not allowed`
- Active-state action: `Stop AI data processing`

Before revoking, show a confirmation dialog:

**Title:** `Stop AI data processing?`

**Body:** `GossipAI will stop sending your information to OpenAI. AI features will be unavailable until you allow AI data processing again. Your existing GossipAI account and locally stored conversation history are not deleted by this setting.`

**Actions:** `Cancel` and destructive `Stop AI data processing`.

After a successful revoke response:

1. Clear the in-memory and persisted consent cache.
2. Destroy the active ChatKit client/session.
3. Delete every cached `clientSecret`, OpenAI/ChatKit thread/session identifier,
   and pending AI-request payload from device storage.
4. Cancel in-flight AI requests where the networking layer permits it, and
   ignore any late response.
5. Disable AI composer controls and show the consent-required state.

If revocation fails, keep the current state and tell the user that permission
could not yet be changed. Do not claim it was revoked locally.

## Do not do these things

- Do not treat account registration, Terms acceptance, cookie consent, or
  opening the Privacy Policy as AI consent.
- Do not hide the disclosure behind an info icon or a link.
- Do not auto-accept after a timeout, app upgrade, login, or device restore.
- Do not send a message, context, image, or create a session while consent is
  pending, unknown, rejected, revoked, or outdated.
- Do not retry an AI request after `AI_CONSENT_REQUIRED` or
  `AI_CONSENT_VERSION_OUTDATED` without a new user action.

## QA checklist

- New account: first AI attempt shows the disclosure before any AI/session
  request; `Not now` sends no AI traffic.
- New account: granting the current version enables the original AI action and
  records active consent after app restart.
- Existing account: the first AI attempt requires new consent.
- Policy update: a mismatched version shows the disclosure again and blocks AI
  until the new version is granted.
- Rejected/revoked consent: every AI entry point stays blocked, including a
  background/resumed app and ChatKit session restoration.
- Image flow: selecting an image before consent does not upload or transmit the
  image; the user must grant first and then explicitly initiate the send.
- Revocation: active client secret/session and queued requests are removed;
  reopening the app cannot silently resume AI.
- Offline mode: unknown consent does not permit AI.
- Accessibility: controls have accessible labels, the disclosure can be read by
  VoiceOver, and both actions are reachable by keyboard/switch control.
- iOS device test: verify the complete sequence on a real iPhone before
  submission, using a review-equivalent account.

## App Store Connect review notes

Add this concise note to the next submission, adjusted only if navigation
labels change:

> Before the first use of AI, GossipAI displays a dedicated consent screen that
> identifies OpenAI, lists the user data sent for an AI request, links to the
> Privacy Policy, and requires an affirmative choice. Choosing "Not now" blocks
> AI requests. The user can withdraw permission at any time in Settings -> AI
> data processing; this disables AI and clears the local AI session. To review,
> sign in, open any AI chat, and tap the send/start action.
