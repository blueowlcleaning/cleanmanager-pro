# Workspace Instructions for cleanmanager-pro

This repository is a minimal React + Vite frontend with Stripe serverless checkout logic.

## Project overview

- Frontend is in `src/` using React 19 and Vite.
- Static/public assets live in `public/`.
- Vercel-style serverless API endpoints are in `api/`.
- Netlify-compatible functions are in `netlify/functions/`.
- The app is configured as an ESM project (`type: "module"`).
- The frontend uses `@vitejs/plugin-react`, not the React compiler.
- There is no TypeScript setup in this repository.

## Recommended development commands

- `npm install`
- `npm run dev` to start the Vite dev server
- `npm run preview` to preview the production build locally
- `npm run build` to build the production bundle
- `npm run lint` to run ESLint over the repo

## What to do when helping

- Keep changes aligned with the existing Vite + React structure.
- Favor simple React/JSX edits in `src/` and avoid introducing a new frontend framework.
- Preserve the current app architecture rather than introducing broad rewrites.
- When backend changes are needed, prefer updating the serverless code in `api/` and `netlify/functions/`.
- Do not modify generated or platform-specific output directories like `dist/`.
- Use the existing routing conventions for Vercel and Netlify; do not assume a full Express/Node backend.

## Key file locations

- `src/App.jsx` and `src/main.jsx` are the main frontend entry points.
- `src/App.nsx` may contain related UI or helper content alongside React sources.
- `api/create-checkout.js` and `api/stripe-webhook.js` are Vercel-style API routes.
- `netlify/functions/create-checkout.js` and `netlify/functions/stripe-webhook.js` are Netlify-compatible serverless endpoints.
- `vite.config.js` contains the Vite build and dev configuration.
- `eslint.config.js` describes lint rules used by this project.

## Stripe and environment notes

- Serverless code uses `process.env.STRIPE_SECRET_KEY`.
- Checkout creation expects a `priceId` in the request body.
- Success/cancel URLs are currently hard-coded to Vercel and Netlify app domains in the serverless route.
- If you change Stripe behavior, confirm endpoint environment variables and redirect URLs match the deployment target.
- Avoid adding payment logic that depends on server-only packages in the browser bundle.

## Best practices for AI assistance

- Prefer small, focused fixes over broad rewrites.
- Keep the app consistent with the current React + Vite + Stripe setup.
- Avoid adding TypeScript unless explicitly requested.
- Ask for clarification when a change impacts deployment target, environment variables, or Stripe config.
- Maintain the minimal ESM project style; do not convert the repo to CommonJS.

## Useful prompts for this repo

- "Update the React UI in `src/App.jsx` to show subscription options and call the checkout endpoint."
- "Fix the Stripe checkout route so it validates `priceId` and returns a helpful error message."
- "Add a new Netlify function that sends webhook events to Stripe and validates signatures."
- "Review the Vite config and ensure the app builds successfully for production."
