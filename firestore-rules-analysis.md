# Firestore rules analysis — 2026-09-10

## Current client access pattern

- `src/lib/auth.ts` reads `users/{request.auth.uid}` after Firebase Auth sign-in.
- No client-side Firestore writes or collection queries are currently implemented.
- User documents contain private data: email, name, role, and active status.

## Security decision and attack review

- Only the authenticated document owner may read their profile.
- Client profile writes are denied, preventing role assignment, ownership
  hijacking, schema pollution, oversized writes, and permission escalation.
- All other paths are denied until scoped client operations and validation rules
  are implemented.
