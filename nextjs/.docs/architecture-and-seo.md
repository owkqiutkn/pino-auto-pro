## Pino Auto Pro – Architecture, Packages, and SEO

### Architecture Overview

- **Framework & Runtime**
  - **Next.js App Router** application in `src/app`, using **server components by default** and client components where interactivity is needed.
  - Global `layout.tsx` wraps the app with theming, global styles, analytics, and optional Google Analytics.

- **App Structure**
  - **Public marketing & inventory**
    - `/` (`src/app/page.tsx`): main marketing/landing page that fetches featured cars and supporting content from Supabase on the server.
    - `/inventory` (`src/app/inventory/page.tsx`): inventory listing with filtering via URL search params.
    - `/inventory/[slug]` (`src/app/inventory/[slug]/page.tsx`): individual vehicle detail pages with gallery and car attributes.
    - `/legal` and `/legal/[document]`: legal documents with a dedicated layout and sidebar navigation.
    - `/new-landing`: alternative landing page using the same data/domain layer.
  - **Auth area**
    - `/auth` layout: shared two-column layout (marketing + auth forms).
    - Routes for login, register, verify email, forgot/reset password, and 2FA.
  - **App (admin/user) area**
    - `/app` layout: authenticated application shell using `GlobalProvider` and `AppLayout`.
    - Routes for dashboards, user settings, and admin-style CRUD for cars, brands, categories, and brand models.

- **State & Context**
  - `GlobalContext` provides user/session and loading state across the `/app` area.
  - Most form and UI state is handled locally via React hooks in client components.

### Routing & Pages

- **Top-level routing**
  - File-based routing under `src/app` using the Next.js App Router.
  - `layout.tsx` defines the root HTML structure, theme class, analytics, and global metadata.

- **Key routes**
  - `/`: marketing home with hero, search, featured inventory, financing, testimonials, trade-in, and contact/footer sections.
  - `/inventory`: filterable inventory index using search params mapped to Supabase queries.
  - `/inventory/[slug]`: vehicle detail page, server-rendered with images and car-specific metadata.
  - `/auth/*`: authentication flows, mostly client components that talk to Supabase via SPA clients.
  - `/app/*`: authenticated dashboard and management interfaces.
  - `/legal/*`: legal content pages rendered from React/markdown-based components.

### Data & External Services

- **Supabase**
  - Central domain client `SassClient` in `src/lib/supabase/unified.ts` encapsulates:
    - **Auth**: email/password login, registration, logout, email verification, and MFA flows.
    - **Domain data**: cars, brands, categories, brand models, car images, and todo list operations.
    - **Storage**: generic files and car images, including signed URLs and delete/reorder operations.
  - Environment-specific factories create:
    - **SSR clients** for server components and route handlers.
    - **SPA clients** for browser-based flows.
    - **Server admin client** using service-role keys for privileged server-only operations.
  - Middleware keeps Supabase auth sessions synced with cookies so SSR components see the correct user.

- **Analytics & Tracking**
  - `@vercel/analytics` mounted in the root layout.
  - `GoogleAnalytics` from `@next/third-parties/google` when `NEXT_PUBLIC_GOOGLE_TAG` is configured.

- **Other external integrations**
  - **Paddle** (`@paddle/paddle-js`, `@paddle/paddle-node-sdk`) for billing/subscriptions.
  - **Maps & visualization** via `@vis.gl/react-google-maps`, `maplibre-gl`, and `recharts`.
  - **Markdown content** via `react-markdown` for rich text and legal content.

### Key Packages & Dependencies

- **Framework & Core**
  - `next`, `react`, `react-dom`, `typescript`, `@types/*`.

- **Styling & UI**
  - `tailwindcss`, `postcss`, `tailwindcss-animate`.
  - `class-variance-authority`, `clsx`, `tailwind-merge`.
  - Radix UI primitives: `@radix-ui/react-alert-dialog`, `@radix-ui/react-dialog`, `@radix-ui/react-slot`.
  - Icons via `lucide-react`.

- **Data & Backend**
  - `@supabase/supabase-js`, `@supabase/ssr` for data, auth, and storage.

- **Billing**
  - `@paddle/paddle-js`, `@paddle/paddle-node-sdk` for client- and server-side Paddle integration.

- **Analytics & Maps**
  - `@vercel/analytics`, `@next/third-parties` (Google Analytics).
  - `@vis.gl/react-google-maps`, `maplibre-gl` for maps.
  - `recharts` for charts and dashboards.

- **Content & Markdown**
  - `react-markdown` for rendering markdown-based pages.

- **Tooling**
  - `eslint`, `eslint-config-next`, `@eslint/eslintrc`.
  - `tailwindcss`, `postcss` for build-time styling.

### SEO Overview

- **What is working**
  - Next.js App Router with **server components** for marketing and inventory pages ensures that search engines see fully rendered HTML.
  - `layout.tsx` exports global `metadata`, providing a default title (from `NEXT_PUBLIC_PRODUCTNAME`) and description.
  - Vehicle detail pages (`/inventory/[slug]`) implement `generateMetadata` to produce:
    - **Per-car titles** (e.g., `year brand model | Dealer Name`).
    - **Per-car descriptions** with year, brand, model, and mileage.
    - **Canonical URLs** using `NEXT_PUBLIC_SITE_URL`.
    - **Open Graph** metadata including car images for rich link previews.
  - `src/app/sitemap.ts` dynamically generates a sitemap including `/inventory` and every available vehicle detail page with frequencies and priorities.

- **Gaps and opportunities**
  - The global description in `layout.tsx` is still generic SaaS copy and should be updated to match the auto dealership domain.
  - Many routes (home `/`, `/inventory`, `/legal/*`, `/new-landing`, `/app/*`, `/auth/*`) currently rely on global metadata and do not define their own titles/descriptions or canonical URLs.
  - Only vehicle detail pages set explicit canonicals; other key routes could benefit from them.
  - There is no explicit `robots.txt` or `robots` route, and no per-page `robots` configuration to keep `/app/*` and `/auth/*` out of the index.
  - The sitemap does not yet include `/`, `/legal/*`, `/new-landing`, or other public marketing pages.
  - No JSON-LD / structured data is yet defined (e.g., `Organization`/`LocalBusiness` on the home page or `Vehicle` schema on detail pages).

