Demo video Link: [https://youtu.be/JGoUmz6FKws]

# Rural Immersion Assignment

This repository contains a React + Vite interview assignment for a rural immersion management workflow. The application includes:

- Authentication with token refresh handling
- A protected destinations dashboard
- Destination search, pagination, create, edit, and delete flows
- Automated tests backed by a browser-side mock API

## Project Location

The app lives in `assignment/`.

```text
rural_imm/
	assignment/
```

## Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

## Installation

From the repository root:

```bash
cd assignment
npm install
```

If PowerShell blocks `npm` because of execution policy on Windows, use:

```powershell
cd assignment
npm.cmd install
```

## Run Locally

Start the development server:

```bash
cd assignment
npm run dev
```

Windows PowerShell fallback:

```powershell
cd assignment
npm.cmd run dev
```

Then open the local URL printed by Vite, typically `http://localhost:5173`.

## Interviewer Login

The development and test setup automatically enables the mock API when no real API domain is configured, so no backend setup is required for review.

Use these credentials on the login screen:

```text
Email: manager@ruralimmersion.com
Password: Password123!
```

## Manual Verification Checklist

After signing in, verify the following flows:

1. Protected route behavior: opening `/destinations` while signed out redirects to `/login`.
2. Login validation: invalid email format and short passwords show client-side validation errors.
3. Dashboard load: the destinations table loads seeded mock data.
4. Search: searching by destination name filters the visible rows.
5. Pagination: changing page size and moving between pages updates the results.
6. Create: adding a destination inserts a new item into the list.
7. Edit: editing an existing destination updates the row content.
8. Delete: deleting a destination removes it from the list after confirmation.
9. Session handling: the app is wired for token refresh and logout on refresh failure.

## Automated Verification

Run these commands from `assignment/`:

```bash
npm run lint
npm run test:run
npm run build
```

Windows PowerShell fallback:

```powershell
npm.cmd run lint
npm.cmd run test:run
npm.cmd run build
```

## Verified Status

The following commands were executed successfully in this workspace on April 17, 2026:

- `npm.cmd run lint`
- `npm.cmd run test:run`
- `npm.cmd run build`

The automated test suite currently reports 6 passing tests.

## Notes

- The app uses a browser-side mock API in development and tests by default.
- A real backend can be connected by setting `VITE_API_DOMAIN`, but that is not required for interviewer review.

## Interview Notes

### Implementation Choices

- The app uses React Router route guards to separate public and protected flows.
- Authentication is centralized behind a shared auth client with token refresh support.
- Destination data access is isolated in API and feature hooks so UI concerns stay separate from request logic.
- A browser-side mock API is enabled by default in development and test to make the assignment reviewable without backend setup.
- The test suite focuses on user-facing flows instead of isolated implementation details.

### Tradeoffs

- The mock API improves portability for interviews, but it does not replace full integration testing against a live backend.
- Form validation is intentionally lightweight and local to the feature for clarity; a larger app would likely centralize schema validation.
- The current test coverage is strongest around the main happy paths and key session failure handling, not around every UI permutation.

### Known Limitations

- The current review flow relies on a mock API by default, so it does not fully validate backend integration behavior.
- Automated coverage is focused on core user workflows and does not yet include exhaustive edge-case or visual regression testing.
- The app currently documents and verifies the existing assignment scope only; broader production concerns such as analytics, role-based access variation, and observability are out of scope.

### Use Of Generative AI

- Generative AI was used as an implementation aid for drafting documentation, accelerating iteration, and checking developer workflow details.
- All code and documentation changes were reviewed in the repository context before being kept.
- Final setup instructions, verification steps, and outcomes were validated against the local project by running the actual commands in this workspace.

