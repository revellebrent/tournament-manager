# Tournament Manager

A modern, client-side web app for organizing and viewing youth sports tournaments. Built with **React + Vite**, it supports role-based dashboards for **Directors, Coaches, and Parents**, plus public, no-login **Spectator** pages (Schedules & Standings).

> Status: prototype / demo. Data is stored in the browser (localStorage) via simple utilities in `src/utils/`. No backend is required to run locally.

---

## Features

- **Role-based dashboards**
  - Director: bracket builder (read-only for others), schedule board (edit fields, kickoff, scores), publish divisions
  - Coach: apply to tournaments
  - Parent: upload/share player cards with coach
  - Spectator: public schedule & standings (no login)
- **Public pages**
  - `/public/:tid/schedule`, `/public/:tid/standings`
- **Responsive header with user menu (BEM CSS)**
  - Collapses to a hamburger on small screens
- **Accessibility**
  - Skip link, ARIA attributes, keyboard support (Esc closes menus)
- **BEM CSS naming**
- **ESLint 9 + Prettier 3** with pre-commit checks (via `simple-git-hooks` + `lint-staged`)

---

## Tech Stack

- **React** 19
- **React Router** 7
- **Vite** 7 (dev server & build)
- **ESLint** 9, **Prettier** 3
- **BEM** CSS (plain CSS files)

**Minimum Node**: 18.17+ (Node 20/22 also OK)  
**Package manager**: npm 9+

---

## Roadmap / Ideas

- Real backend (auth, tournaments, divisions, matches)

- Realtime updates for scores/fields/kickoff

- Import/export for brackets and schedules

- Unit tests (Vitest + Testing Library)

---

## Getting Started

```bash
# 1) Install dependencies
npm install

# 2) Start the dev server
npm run dev

# 3) Build for production
npm run build

# 4) Preview the production build
npm run preview

```
