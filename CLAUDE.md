# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

YLPMS (Youth Leadership Program Management System) — a role-based leadership management platform for Combine Foundation, replacing spreadsheets with a Next.js + Firebase web app. See `Agents.md` for the full product spec (role permissions, Firestore collection list, UI theme, MVP/future scope) — read it when a task touches permissions, new collections, or UI styling decisions.

## Commands

```bash
npm run dev     # start dev server (Next.js, webpack mode, http://localhost:3000)
npm run build   # production build
npm run start   # run a production build
npm run lint    # next lint (eslint-config-next, flat config in eslint.config.mjs)
```

There is no test suite configured in this repo (no test script/framework in `package.json`).

### Environment

Client Firebase config (`NEXT_PUBLIC_FIREBASE_*`) goes in `.env.local` per `README.md`. Server-side secrets live in `.env`: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (Admin SDK service account) and `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`/`SMTP_FROM`/`SMTP_TLS_REJECT_UNAUTHORIZED` (nodemailer, used for OTP emails and sending generated user credentials).

Firebase project config for the CLI lives in `firebase.json` / `.firebaserc` / `firestore.rules` / `firestore.indexes.json` / `storage.rules` at the repo root.

## Architecture

### Two separate Firebase clients

- `src/lib/firebase.ts` — **client-side** Firebase SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`), used from `"use client"` components. Login (`src/components/LoginContent.tsx`) signs in directly against Firebase Auth from the browser.
- `src/lib/firebase-admin.ts` — **server-only** Firebase Admin SDK (`import "server-only"`), used from API routes/services via `getFirebaseAdminAuth()` / `getFirebaseAdminDb()`. Never import this from client components.

All Firestore reads/writes on the server go through `src/utils/firestore.ts` (`getDocById`, `queryDocs`, `createDoc`, `updateDoc`, `deleteDocFromFirestore`, `batchWrite`, etc.) — a thin wrapper around the Admin SDK that stamps `createdAt`/`updatedAt` and strips `undefined` fields. Add new server data-access through this module rather than calling `firebase-admin/firestore` directly.

### Auth flow

1. Client signs in with `signInWithEmailAndPassword` (Firebase Auth), gets an ID token, stores it in `localStorage`.
2. The user's `role` is read from their Firestore `users/{uid}` document (not just custom claims) and used to route to the correct role-prefixed dashboard (see routing table below).
3. API routes are protected with `withAuth` / `withRole` from `src/middleware/auth.middleware.ts`: these verify the bearer ID token via the Admin SDK, look up the Firestore `users/{uid}` doc for the role, and attach `req.user = { userId, email, role }`.
4. Route handlers additionally use helpers from `src/utils/auth.ts` (`requireRole`, `requireCanManage`, `canAccessResource`, `requireResourceAccess`) for fine-grained checks beyond the coarse role gate.

### Role hierarchy

Defined redundantly as a `roleHierarchy` map in **both** `src/middleware/auth.middleware.ts` (`withRole`) and `src/utils/auth.ts` (`checkRoleAccess`/`canManageUser`) — keep them in sync when changing role levels:

```
developer(6) > head-ro(5) > sro(4) > ro(3) > youth-leader(2) > volunteer(1)
```

Higher-numbered roles can manage/access lower ones. `firestore.rules` enforces a narrower, complementary rule at the database level: only `developer` role can create/delete `users` docs or write to any other collection; a user may only self-update `lastLoginAt` on their own profile.

### Route → role mapping

App Router pages are grouped by role under `src/app/`, each with matching component trees under `src/components/`:

| Role | Route prefix | Components dir |
|---|---|---|
| developer / head-ro | `/Head-of-RO/*` | `src/components/Head-of-RO/` |
| sro | `/SRO/*` | `src/components/SRO/` |
| ro | `/RO/*` | `src/components/RO/` |
| youth-leader | `/youth-leader/*` | `src/components/Youth-Leader/` |
| volunteer | `/volunteer/*` | `src/components/volunteer/` |

Note the inconsistent casing between `src/app/` folders (`Head-of-RO`, `RO`, `SRO`, `youth-leader`, `volunteer`) and `src/components/` folders (`Head-of-RO`, `RO`, `SRO`, `Youth-Leader`, `volunteer`) — match whichever tree you're editing, don't assume they mirror exactly.

### Layered structure (per feature)

`app/<role>/<feature>/page.tsx` (thin, renders a component) → `components/<Role>/<feature>/*Content.tsx` (client UI) → `hooks/` (Zustand store + fetch hooks, e.g. `useUser.ts`) → `app/api/**/route.ts` (Next.js route handler, wrapped in `withAuth`/`withRole`) → `services/*.service.ts` (business logic + activity logging) → `utils/firestore.ts` (Admin SDK data access) → Firestore.

Validation at the API boundary uses Zod schemas from `src/utils/validation.ts` (e.g. `createUserSchema`, `updateTaskSchema`); domain types live in `src/types/*.types.ts` (e.g. `user.types.ts` defines the `User` discriminated union over `HeadRO | SRO | RO | YouthLeader | Volunteer`, each with role-specific fields like `assignedROIds`).

Mutating service functions (e.g. `createUser`, `updateUser`, `deleteUser`, `assignUsersToManager` in `src/services/user.service.ts`) write an `activityLogs` entry via `src/services/activitylog.service.ts` — follow this pattern for new mutations.

### Error handling convention

Services/routes throw typed errors from `src/utils/errors.ts` (`ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ConflictError`, `RateLimitError`), then `handleError()` converts them to a consistent `{ success: false, error: { message, code, statusCode } }` JSON shape; successes are `{ success: true, data }`. `handleApiRoute` in the auth middleware wraps this pattern for simple handlers.

### List/table UI pattern

Newer role-management screens (e.g. `src/components/Head-of-RO/ros/` and `src/components/Head-of-RO/sro/`) split a feature into `XList.tsx` (container + state) + `XTable.tsx` + `XTableRow.tsx` + `XToolbar.tsx` (+ `XFormModal.tsx` / `AssignXModal.tsx` for CRUD dialogs) + `x.types.ts`. Prefer this decomposition over one large `*Content.tsx` file for new list-heavy screens, per the `Agents.md` component-size limits (~300 lines/component, ~500 lines/page).

### Portal scope (developer "acting as")

The SRO, RO, Youth Leader and Volunteer portals show one person's data. A user of that role always gets their own; a developer picks whose via `PortalScopePicker`, sent as `?sroId=` / `?roId=` / `?youthLeaderId=` / `?volunteerId=` (`src/utils/portal-scope.ts`). Server routes resolve it with `resolveScopeId` / `resolveActingAs` (`src/utils/sro-scope.ts`); client code uses `usePortalScope` / `usePortalData` / `scopedPath` (`src/hooks/usePortalScope.ts`).

### Activity workflow (events → certificates)

`src/services/event.service.ts` runs Create → Submit → Review → Approve → Conduct → Submit Evidence → Verify → Certificates. A youth leader's event starts as `draft`; their RO (or anyone above them in the chain) approves it and later verifies the evidence, which issues certificates (`src/services/certificate.service.ts`, `certificates` collection). Events organized by an RO or above start `planned` and complete when their organizer submits evidence. Status only changes through `POST /api/events/[eventId]/workflow`; the list endpoints return per-viewer `permissions` so the UI (`src/components/shared/activities/ActivityBoard.tsx`, used by every portal) never re-derives the rules.

### Member requests

Below Head RO, accounts are requested, not created: an RO requests a youth leader (their SRO approves), a youth leader requests a volunteer (their RO approves). See `src/services/member-request.service.ts`; approval calls `createUser` under the requester.

Every new account gets a program ID (`memberId`, upper-case, unique; `src/utils/member-id.ts`): typed on the Head RO's add forms and on an RO's youth leader request; for volunteers the approving RO enters it on approval. Older accounts may have none.

### Cohorts and public stats

The program runs in cohorts (`src/services/cohort.service.ts`, `cohorts` collection; YLP 2.0 = 15 Sep 2026 – 15 Mar 2027 is built in via `src/config/cohorts.ts` until its doc is written). The latest cohort is current: new youth leaders/volunteers get its `cohortId` (none = YLP 2.0), `withAuth` blocks youth leaders/volunteers outside a running current cohort, and monthly cycles restart from its start date. Head RO starts the next cohort from Settings once the current one has ended. The Home and Login pages show YLP 1.0's fixed figures (`YLP_1` in the config) plus live Firestore counts from `src/services/public-stats.service.ts` (cached 10 min; definitions in its header). Activities record `mode` (onsite / online = webinar). University and city fields only accept names from `src/config/hec-universities.ts` (hec.gov.pk list) and `src/config/pakistan-cities.ts`, picked with `SearchableSelect` (`src/components/shared/PlaceSelects.tsx`) and checked by `src/utils/places.ts`; for youth leaders and volunteers the `region` field holds their city.

### Activities naming

Events are called "Activities" in every portal (`/<portal>/activities`); the old `/…/events` pages only redirect. A youth leader's task can link to one of their open activities (`eventId`/`eventTitle` on the task, validated in `task.service.ts`).

### OTP flow

`src/app/api/auth/send-otp` / `verify-otp` and `src/lib/otp-store.ts` implement an in-memory OTP store (email → code, 5 min TTL, 5 attempts). It's explicitly dev-only / single-instance (won't survive serverless cold starts or multiple instances) — the module header notes swapping in Redis/Upstash/Vercel KV or a DB table for production, keeping the same function signatures (`setOtp`, `verifyOtp`).

## Coding conventions (from Agents.md)

- TypeScript, functional components, Server Components by default (Client Components only when interactivity is needed).
- File naming: components `PascalCase.tsx`, pages `page.tsx`, hooks `useX.ts`, services `x.service.ts`, types `x.types.ts`.
- Forms: React Hook Form + Zod.
- Use shadcn/ui components where possible over custom ones; Tailwind for styling.
- Commit prefixes: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`.
