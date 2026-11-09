# Unified chat / reply lifecycle

## Deployment order

1. Apply `prisma/migrations/20260912000000_add_chat_reply_state/migration.sql` through the normal `prisma migrate deploy` workflow on the existing database.
2. Generate Prisma Client and deploy/restart the backend.
3. Release the mobile JavaScript changes. No new native dependency was added.

The mobile client requires the new reply-state endpoint. Do not release it against an older backend. This change adds nullable fields; existing conversations/messages are preserved.

## Lifecycle

- Each new mobile turn has a stable `requestId` and conversation ID before the request starts. User-scoped server message IDs provide idempotency.
- The server stores the accepted user turn as `processing`. Reply and rolling memory commit together, then the status becomes `completed`.
- The mobile runtime survives screen unmounts; persisted pending turns are reconciled after relaunch/foregrounding. History is fetched from the server. A transport timeout does not imply the AI failed.
- An explicit server failure is retryable with the same request ID, without duplicating the message or charging quota again. Processing attempts older than 15 minutes become interrupted/failed; a superseded attempt cannot commit.
- This is not a durable job queue: after a server process failure, the interrupted turn requires retry. Closing/backgrounding the mobile app does not cancel an accepted server request.
- Reply notifications contain generic localized text, not private message content. Background display is handled by FCM/APNs. Foreground notifications refresh history and show an in-app toast only outside the visible chat.

## Automated verification

- Backend: `npm run typecheck`, `npx prisma validate`, `npm test`.
- Mobile: `npx tsc --noEmit`, `npm run lint`, `node --test scripts/test-chat-runtime.cjs`.
- Database integration: provision the current schema in a disposable local PostgreSQL database named `gossipai_chat_schema_*`, then run `DATABASE_URL=postgresql://USER@localhost/NAME npx tsx --test scripts/test-chat-reply-integration.ts`. The script refuses remote databases and other database names. It uses deterministic model replies and removes its own fixture user.

Covered: duplicate submits; account/consent changes; switching chats with a pending reply; transport loss and runtime recreation; failure/retry; ownership; transactional memory; quota idempotency; 110-message cursor pagination; deletion during inference; 13-language dictionaries; exact notification deep links.

The two-column migration was applied against the pre-change schema in isolated local PostgreSQL and the resulting schema matched Prisma. Full historical migration replay from an empty database currently fails at the pre-existing `20260505000000_add_premium_expires_at` migration because the baseline does not create `users`; this unrelated baseline was not modified.

## Device checks still needed before release

- Real iOS and Android devices with push permission and configured Firebase/APNs: send a message, background/terminate the app after acceptance, wait for the localized notification, tap it, and verify the exact conversation opens once.
- Repeat with app languages different from the OS language, including `de` and `es-419`; change language while waiting.
- Read older messages while a response arrives: no forced jump, use the new-reply button. Check long responses, keyboard show/hide, search, pagination, Dynamic Type, light/dark themes and all persona accents.
- Repeat offline/online and with revoked notification permission. No live AI request or real-device push delivery was used by the automated tests.
