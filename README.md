# Tournament Manager

A modern, client-side web app for organizing and viewing youth sports tournaments. Built with **React + Vite**, it supports role-based dashboards for **Directors, Coaches, and Parents**, plus public, no-login **Spectator** pages (Schedules & Standings).

> **Status:** prototype / demo. Data is stored in the browser (localStorage) via simple utilities in `src/utils/`. No backend is required to run locally.

---

## Demo

- **5-minute video:** _[add link here]_
- **Screens:** Home → Public Tournament → Schedule/Standings → Login (mock) → Director Dashboard → Bracket Builder → Publish

### Screens

<table>
  <tr>
    <td><strong>Home</strong><br><img src="/docs/screens/home.png" width="480" /></td>
    </tr>
    <tr>
    <td><strong>Public Tournament</strong><br><img src="/docs/screens/publictournament.png" width="480" /></td>
  </tr>
  <tr>
    <td><strong>Player Card Upload</strong><br><img src="/docs/screens/playercardupload.png" width="480" /></td>
  </tr>
  <tr>
    <td><strong>Director Dashboard</strong><br><img src="/docs/screens/directordashboard.png" width="480" /></td>
    </tr>
    <tr>
    <td><strong>Bracket Builder</strong><br><img src="/docs/screens/bracketbuilder.png" width="480" /></td>
  </tr>
  <tr>
    <td><strong>Spectator</strong><br><img src="/docs/screens/spectator.png" width="480" /></td>
    </tr>
    <tr>
    <td><strong>Login (mock)</strong><br><img src="/docs/screens/loginmock.png" width="480" /></td>
  </tr>
</table>

---

## Features

- **Role-based dashboards**
  - **Director:** bracket/division management (client-side), schedule board (edit fields, kickoff, scores), publish/unpublish divisions
  - **Coach:** apply to tournaments; view/forward player cards from parents
  - **Parent:** upload & share player cards to a coach
  - **Spectator:** public schedule & standings (no login)
- **Public pages**
  - `/public/:tid/schedule` and `/public/:tid/standings`
- **Responsive UI**
  - Header with user menu; collapses to a hamburger on small screens
- **Accessibility**
  - Skip link, ARIA labels, keyboard support (e.g., Esc closes menus)
- **Clean code style**
  - BEM CSS; **ESLint 9 + Prettier 3** with pre-commit checks

---

## Tech Stack

- **React 18**, **React Router v6**, **Vite 7**
- **CSS** (component files, BEM naming)
- **LocalStorage “DB”** (`src/utils/db.js`, `src/utils/storage.js`)
- Weather & alerts: **Open-Meteo** (`src/utils/openMeteo.js`) and **NWS** (`src/utils/nwsAlerts.js`)
- **Mock auth** with Context (`src/context/AuthContext.jsx`)

**Node:** 18.17+ (20/22 OK) · **npm:** 9+

---

## Current Scope (Frontend Only)

- React + Vite SPA with public Schedule/Standings and role-based dashboards.
- Data stored in localStorage; seeded tournaments (no server).
- Scheduling and standings are pure functions in the client.

### Not in Scope (Yet)

- Create/Update/Delete tournaments on a server.
- Server auth/RBAC and multi-user persistence.

### Next Steps

1. Add `apiClient` and move `db.js` operations to REST endpoints.
2. Implement **Create Tournament** (POST `/tournaments`) with validation and director-only access.
3. Persist divisions, matches, and standings on the server; client becomes read-only for those resources.
4. Real auth: login, `/auth/me`, protected routes, and server-side role checks.

---

## Quick Route Map

- `/` — Home (seeded tournaments)
- `/tournament/:id` — Public tournament details (venue, links to schedule/standings)
- `/public/:tid/schedule` — Public schedule with search/filters/“Now” window
- `/public/:tid/standings` — Public standings (Pts, GD, GF)
- `/dashboard` — Role dashboard (Director/Coach/Parent/Spectator)
- `/director/schedule/:id` — Director schedule board (client-side editing)

---

## Mock Auth (for review/demo)

From the header:

1. Click **Login**.
2. Enter any email (e.g., `director@example.com`).
3. Choose a role (Director / Coach / Parent / Spectator).
4. You’ll be redirected to `/dashboard`.

> Auth state is saved in `localStorage: "auth"`. Clearing site data/logging out resets it.

---

## Getting Started

```bash
# 1) Install
npm install

# 2) Dev server
npm run dev

# 3) Build
npm run build

# 4) Preview production
npm run preview

```

---

### Lint/format:

npm run lint
npm run format

---

### Directory Overview

```text
src/
  main.jsx                  # BrowserRouter + App mount
  App.jsx                   # AppShell + routes + auth modals
  index.css                 # page frame (.page, .page__surface)

  context/
    AuthContext.jsx         # mock auth (localStorage "auth")

  components/
    Header/                 # header + user menu & auth triggers
    Footer/                 # footer inside page surface
    ProtectedRoute/         # UI route guard by role
    DashboardRouter/        # picks dashboard by role
    DirectorDashboard/      # director tools (+ BracketBuilder)
    CoachDashboard/         # coach tools (apps, roster/cards inbox)
    SpectatorDashboard/     # spectator browse
    PublicSchedule/         # public schedule (filters & "Now" window)
    PublicStandings/        # standings table
    TournamentDetails/      # tournament page

  utils/
    db.js                   # localStorage-backed domain ops + math
    storage.js              # getJSON/setJSON with safe fallbacks
    tournaments.js          # seeded tournaments
    openMeteo.js            # forecast
    nwsAlerts.js            # NWS alerts
```

---

### Implementation Notes

- Math: Round-robin generator and standings are pure functions in utils/db.js.
  - Round-robin: k\*(k-1)/2 matches; “circle method”; odd teams get a bye.
  - Standings: gp, w, d, l, gf, ga, gd, pts (3/1/0), sorted by Pts → GD → GF.

- Layout: Header & Footer are intentionally inside .page\_\_surface (rounded card) for a single-surface feel.

- Weather/Alerts: Tolerant to network failure; fallbacks avoid UI crashes

---

### Roadmap / Ideas

- Real backend (auth, tournaments, divisions, matches)

- Realtime updates for scores/fields/kickoff

- Import/export for brackets and schedules

- Unit tests (Vitest + Testing Library)
