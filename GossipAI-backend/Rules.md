# Project Rules

## Architecture
- Use vertical, feature-based structure.
- Keep each feature self-contained: `routes`, `controller`, `service`, `schema`, `types`.
- Keep shared cross-cutting concerns under `src/shared`.

## Authentication
- Use JWT access token + refresh token flow.
- Implement refresh token rotation (invalidate used refresh token and issue a new one).
- Protect private routes with auth middleware.
- Validate auth-related request payloads with Zod.

## Coding Standards
- Keep route handlers thin.
- Put business logic into services.
- Centralize error handling with middleware.
- Prefer strict TypeScript types.
