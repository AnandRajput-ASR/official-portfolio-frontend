# Official Portfolio — Frontend

A modern, production-ready **Angular 20** single-page application that serves as a personal portfolio, blog, and admin dashboard. Built with standalone components, lazy-loaded routes, signals, and strict TypeScript.

---

## Tech Stack

| Layer     | Technology                             |
| --------- | -------------------------------------- |
| Framework | Angular 20.3                           |
| Language  | TypeScript 5.9 (strict mode)           |
| Styling   | SCSS (component-scoped)                |
| Reactive  | RxJS 7.8 + Angular Signals             |
| Linting   | ESLint 9 + angular-eslint + Prettier 3 |
| Git Hooks | Husky + lint-staged                    |

---

## Features

- **Portfolio homepage** — hero section, skills grid, work experience (by company), side projects, certifications, testimonials, blog posts, about stats, contact form, resume download
- **Dark / light theme** — toggled via `ThemeService`, persisted in localStorage
- **Blog** — markdown-rendered individual blog post pages (`/blog/:slug`)
- **Admin dashboard** — full CRUD for all portfolio sections, analytics, messages inbox, resume upload, site settings
- **Secret admin login** — admin page is hidden behind a configurable secret URL slug
- **Scroll reveal animations** — `IntersectionObserver`-powered entry animations
- **Fully responsive** — mobile-first, hamburger menu, adaptive layouts
- **SEO optimised** — Open Graph, Twitter Card, structured data, semantic HTML

---

## Project Structure

```
official-portfolio-frontend/
├── src/
│   ├── app/
│   │   ├── app.component.ts       # Root component
│   │   ├── app.config.ts          # Application config (providers, interceptors)
│   │   ├── app.routes.ts          # Lazy-loaded route definitions
│   │   │
│   │   ├── core/                  # Singleton services, models, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts          # Protects /admin/dashboard
│   │   │   │   └── secret-slug.guard.ts   # Validates secret admin URL
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts    # Attaches JWT Bearer token
│   │   │   ├── models/                    # Per-domain TypeScript interfaces
│   │   │   │   ├── analytics.model.ts
│   │   │   │   ├── auth.model.ts
│   │   │   │   ├── blog.model.ts
│   │   │   │   ├── certification.model.ts
│   │   │   │   ├── company.model.ts
│   │   │   │   ├── content.model.ts
│   │   │   │   ├── experience.model.ts
│   │   │   │   ├── hero.model.ts
│   │   │   │   ├── message.model.ts
│   │   │   │   ├── project.model.ts
│   │   │   │   ├── settings.model.ts
│   │   │   │   ├── skill.model.ts
│   │   │   │   ├── stat.model.ts
│   │   │   │   ├── testimonial.model.ts
│   │   │   │   └── index.ts              # Barrel re-export
│   │   │   └── services/
│   │   │       ├── admin.service.ts       # Admin CRUD API calls
│   │   │       ├── auth.service.ts        # Login, logout, token management
│   │   │       ├── cert-badge.service.ts  # Certification badge resolver
│   │   │       ├── content.service.ts     # Public content + analytics tracking
│   │   │       ├── loading.service.ts     # Global loading state
│   │   │       ├── messages.service.ts    # Contact form + admin inbox
│   │   │       ├── resume.service.ts      # Resume info/upload/download
│   │   │       └── theme.service.ts       # Dark/light theme toggle
│   │   │
│   │   ├── features/              # Lazy-loaded feature modules
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/             # Full admin dashboard (CRUD all sections)
│   │   │   │   └── login/                 # Admin login page
│   │   │   ├── blog/
│   │   │   │   └── blog-view.component.ts # Individual blog post page
│   │   │   └── home/
│   │   │       ├── home.component.ts      # Main portfolio page
│   │   │       ├── home.component.html    # Template (~1000 lines)
│   │   │       └── home.component.scss    # Styles
│   │   │
│   │   └── shared/                # Reusable components (if any)
│   │       └── components/
│   │
│   ├── environments/
│   │   ├── environment.ts         # Development config (localhost:3000)
│   │   └── environment.prod.ts    # Production config (relative /api)
│   │
│   ├── index.html                 # HTML shell (SEO meta, Open Graph, JSON-LD)
│   ├── main.ts                    # Bootstrap
│   └── styles.scss                # Global styles
│
├── tsconfig.json                  # TypeScript config with path aliases
├── angular.json                   # Angular CLI config
├── eslint.config.js
├── .prettierrc (in package.json)
└── package.json
```

---

## Path Aliases

Configured in `tsconfig.json` for clean imports:

| Alias         | Maps To              | Example                                                         |
| ------------- | -------------------- | --------------------------------------------------------------- |
| `@core/*`     | `src/app/core/*`     | `import { AuthService } from '@core/services/auth.service'`     |
| `@shared/*`   | `src/app/shared/*`   | `import { ... } from '@shared/components/...'`                  |
| `@features/*` | `src/app/features/*` | `import { HomeComponent } from '@features/home/home.component'` |
| `@env/*`      | `src/environments/*` | `import { environment } from '@env/environment'`                |

---

## Routes

| Path               | Component            | Guard             | Description                |
| ------------------ | -------------------- | ----------------- | -------------------------- |
| `/`                | `HomeComponent`      | —                 | Main portfolio page        |
| `/blog/:slug`      | `BlogViewComponent`  | —                 | Individual blog post       |
| `/admin/dashboard` | `DashboardComponent` | `authGuard`       | Admin panel (JWT required) |
| `/:slug`           | `LoginComponent`     | `secretSlugGuard` | Secret admin login URL     |
| `**`               | —                    | —                 | Redirects to `/`           |

All feature components are **lazy-loaded** via dynamic `import()`.

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **Angular CLI** 20+ (`npm install -g @angular/cli`)
- **Backend API** running (see [official-portfolio-backend](https://github.com/AnandRajput-ASR/official-portfolio-backend))

### 1. Clone & Install

```bash
git clone https://github.com/AnandRajput-ASR/official-portfolio-frontend.git
cd official-portfolio-frontend
npm install
```

### 2. Environment Configuration

Edit the API base URL in the environment files:

**Development** (`src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  api: { baseUrl: 'http://localhost:3000/api' },
  assets: { baseUrl: 'http://localhost:3000/assets' },
};
```

**Production** (`src/environments/environment.prod.ts`):

```typescript
export const environment = {
  production: true,
  api: { baseUrl: '/api' },
  assets: { baseUrl: '/assets' },
};
```

### 3. Start Development Server

```bash
npm run dev
```

Opens `http://localhost:4200` in your browser. Hot-reloads on file changes.

### 4. Build for Production

```bash
npm run build
```

Output: `dist/official-portfolio-frontend/` — deploy to any static hosting.

---

## Available Scripts

| Command            | Description                               |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | Start dev server with auto-open           |
| `npm start`        | Start dev server                          |
| `npm run build`    | Production build                          |
| `npm run watch`    | Build in watch mode                       |
| `npm run lint`     | Run ESLint on all `.ts` and `.html` files |
| `npm run lint:fix` | Auto-fix lint errors                      |
| `npm run format`   | Format all files with Prettier            |
| `npm test`         | Run unit tests (Karma + Jasmine)          |

---

## Admin Access

The admin panel is protected by two layers:

1. **Secret URL slug** — The login page is only accessible at `/{ADMIN_SECRET_SLUG}` (configured in the backend `.env`). Navigating to any other slug redirects to home.

2. **JWT authentication** — After entering the correct slug, the admin must log in with username + password. A JWT token is stored in `localStorage` and attached to all subsequent admin API calls via the `authInterceptor`.

---

## Architecture Decisions

| Decision                   | Rationale                                                                  |
| -------------------------- | -------------------------------------------------------------------------- |
| **Standalone components**  | No NgModules — simpler, tree-shakeable, Angular 20 default                 |
| **Lazy-loaded routes**     | Dashboard (~220 KB) and home (~120 KB) load on demand                      |
| **Functional interceptor** | `HttpInterceptorFn` — modern pattern, no class boilerplate                 |
| **Per-domain model files** | 14 focused files vs one monolithic model — easier to navigate and maintain |
| **Path aliases**           | `@core/`, `@shared/`, `@features/`, `@env/` — no `../../../` imports       |
| **Strict TypeScript**      | `strict: true` + `strictTemplates` — catches bugs at compile time          |
| **Component-scoped SCSS**  | Styles are encapsulated per component, no global CSS conflicts             |
| **Signals for theme**      | `ThemeService` uses Angular Signals for reactive theme state               |

---

## Connecting Frontend and Backend

Both repos are designed to work together:

```
┌─────────────────────┐         ┌─────────────────────────┐
│   Angular Frontend   │  HTTP   │   Express Backend API    │
│   localhost:4200     │ ──────> │   localhost:3000          │
│                      │         │                          │
│  ContentService      │  GET    │  /api/content/*          │
│  AdminService        │  CRUD   │  /api/admin/*            │
│  AuthService         │  POST   │  /api/auth/*             │
│  MessagesService     │  CRUD   │  /api/messages/*         │
│  ResumeService       │  CRUD   │  /api/resume/*           │
└─────────────────────┘         └─────────────────────────┘
                                         │
                                    Supabase
                                   PostgreSQL
```

For production, configure a reverse proxy (Nginx, Cloudflare, etc.) so the frontend is served from the same domain as the API — the production environment uses relative `/api` paths.

---

## License

MIT — see [LICENSE](LICENSE).
