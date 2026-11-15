# FindBack Frontend (independent Git repository)

Responsive React + TypeScript client for the **FindBack — Lost & Found** platform. This directory has its own Git repository, separate from the backend.

**Stack:** React 18, TypeScript, Vite, React Router, Lucide icons, custom responsive CSS.

## Run locally

1. Start the **separate backend** on `http://localhost:5000` (see its README).
2. Run these commands **from this frontend directory**:

```bash
npm install
npm run dev
```

Website: http://localhost:5173

By default, Vite proxies `/api` and `/uploads` requests to `http://localhost:5000` so no `.env` file is needed for local development. Copy `.env.example` to `.env` and set `VITE_API_URL` only if the API is at a different host or when deploying.

## Features

- Sign up / log in
- Browse lost and found posts with search, category/status/type filters and pagination
- Post items with photos, update status, edit or delete your own items
- Item detail page and claim submission
- Sent and received claims, including approve/reject flows
- Responsive UI and notifications

## Scripts

```bash
npm run dev       # Vite development server
npm run build     # TypeScript check and production build
npm run preview   # preview built app
```

## Build / deploy

```bash
npm run build
```

Deploy `dist/` to a static hosting service with a single-page-app route fallback to `index.html`. In deployed environments set `VITE_API_URL=https://your-backend.example/api` **at build time**. The backend must allow your frontend's origin via `CLIENT_ORIGIN`.

## Demo login

The separate backend's `npm run seed` creates sample accounts:

- `demo@findback.dev` / `Demo12345!`
- `visitor@findback.dev` / `Demo12345!`

## Push to GitHub

This ZIP contains **no `.git` directory or existing commits**. Initialize Git yourself, then create an empty GitHub repository and run:

```bash
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/findback-frontend.git
git branch -M main
git push -u origin main
```

MIT licensed.
