# Assignment App

This folder contains the interview assignment application.

## Install

```bash
npm install
```

Windows PowerShell fallback:

```powershell
npm.cmd install
```

## Run

```bash
npm run dev
```

Mock API credentials:

```text
Email: manager@ruralimmersion.com
Password: Password123!
```

## Verify

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

## Notes

- No backend setup is required for local review.
- The mock API is enabled automatically in development and test when `VITE_API_DOMAIN` is not set.
- Repository-level interviewer instructions are available in the parent README.
