# 🍳 HomeCook Marketplace

A modern marketplace connecting home cooks with households seeking culinary services. Built with Next.js, Supabase, Stripe, and deployed on Vercel.

---

## Architecture

```
homecook-marketplace/
├── frontend/              # Client-side code
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Next.js page routes
│       ├── hooks/         # Custom React hooks (useAuth, etc.)
│       ├── lib/           # Supabase client, utilities
│       ├── styles/        # Global CSS, Tailwind config
│       └── types/         # TypeScript type definitions
├── backend/               # Server-side code
│   └── src/
│       ├── config/        # Supabase admin, Stripe config
│       ├── middleware/     # Auth middleware
│       ├── routes/        # API route handlers
│       │   ├── cooks.ts         # Cook search with geo-proximity
│       │   ├── profile.ts       # Profile CRUD
│       │   ├── inquiries.ts     # Contact request management
│       │   └── webhooks/stripe.ts
│       ├── services/      # Business logic layer
│       └── utils/         # Shared utilities
├── .env.example           # All required credentials (template)
├── package.json
├── next.config.js
└── middleware.ts           # Next.js route middleware
```

---

## Features

### For Households
- **Google Sign-In** — one-tap authentication
- **Browse Cooks** — card-based listings with photos, ratings, cuisines
- **Smart Search** — text search across name, cuisine, city, bio
- **Filters** — cuisine type, price range, day availability
- **Geo-Proximity Sort** — find cooks nearest to your location
- **Cook Profiles** — detailed view with availability calendar, bio, reviews
- **Send Inquiries** — contact cooks directly through the platform
- **Favorites** — save cooks for later

### For Cooks
- **Professional Profile** — bio, cuisines, pricing, service radius
- **Availability Calendar** — set weekly time slots (Breakfast/Lunch/Dinner/Full Day)
- **Location-Based Discovery** — get found by nearby households
- **Inquiry Management** — accept or decline household requests
- **Dashboard** — overview of profile views, inquiries, ratings

### Shared
- **Profile Management** — edit all details anytime
- **Account Deletion** — GDPR-compliant full data removal
- **Responsive Design** — works on mobile, tablet, desktop
- **Verified Badges** — Stripe-powered premium verification

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase account (free tier works)
- A Stripe account (test mode)
- A Google Cloud project (for OAuth)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd homecook-marketplace
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning
3. Go to **Settings → API** and copy:
   - `Project URL` → paste as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → paste as `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **SQL Editor** and run the contents of `backend/src/supabase-schema.sql`
   - This creates all tables, indexes, RLS policies, and the proximity search function
   - PostGIS extension is enabled automatically for geo queries

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Go to **APIs & Services → OAuth consent screen**
   - Choose "External" user type
   - Fill in app name ("HomeCook"), support email, and developer email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode
4. Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: add `https://<YOUR_SUPABASE_PROJECT>.supabase.co/auth/v1/callback`
   - Copy `Client ID` → `GOOGLE_CLIENT_ID`
   - Copy `Client Secret` → `GOOGLE_CLIENT_SECRET`
5. In Supabase dashboard, go to **Authentication → Providers → Google**
   - Enable Google provider
   - Paste your Client ID and Client Secret
   - Save

### 4. Set Up Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test Mode** (toggle in top-right)
3. Go to **Developers → API Keys**
   - Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy `Secret key` → `STRIPE_SECRET_KEY`
4. Go to **Developers → Webhooks**
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`
5. For local development, install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe   # macOS
   stripe login
   npm run stripe:listen                    # forwards webhooks to localhost
   ```

### 5. Set Up Google Maps (Optional, for precise geocoding)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
3. Go to **Credentials** and create an API Key
4. Copy → `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
5. Restrict the key to your domains for security

### 6. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with all your credentials
```

### 7. Run

```bash
npm run dev          # Start development server at localhost:3000
```

---

## Deployment on Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add all environment variables from `.env.local` to Vercel:
   - Go to **Settings → Environment Variables**
   - Add each variable from `.env.example`
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
4. Deploy — Vercel auto-detects Next.js
5. Update your Google OAuth redirect URI to include your Vercel domain
6. Update your Stripe webhook endpoint to your Vercel domain

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cooks/search` | Search cooks with filters and geo-proximity |
| GET | `/api/profile` | Get current user's profile |
| POST | `/api/profile` | Create profile (after onboarding) |
| PUT | `/api/profile` | Update profile |
| DELETE | `/api/profile` | Delete account and all data |
| POST | `/api/inquiries` | Send inquiry to a cook |
| GET | `/api/inquiries` | List my inquiries |
| PATCH | `/api/inquiries` | Accept/decline inquiry (cook only) |
| POST | `/api/webhooks/stripe` | Stripe webhook handler |

---

## Database Schema

The schema uses Supabase (PostgreSQL) with PostGIS for geographic queries:

- **profiles** — unified table for cooks and households with role-based fields
- **reviews** — ratings with auto-calculated averages via trigger
- **inquiries** — contact requests with status tracking
- **favorites** — saved cooks per user
- **search_nearby_cooks()** — PostgreSQL function for geo-proximity + filter search

Row Level Security (RLS) is enabled on all tables to ensure users can only access appropriate data.

---

## Tech Decisions

| Choice | Reasoning |
|--------|-----------|
| Supabase | Auth, database, RLS, and PostGIS in one platform. Free tier is generous. |
| PostGIS | Native geographic queries — `ST_DWithin` for radius search is faster than application-level distance calculation |
| Unified profiles table | Simpler queries, single source of truth. Role column differentiates cooks vs households. |
| Stripe for verification | Future-proofed for subscriptions. Verified badge builds trust. |
| Zustand (state) | Lightweight alternative to Redux. Perfect for this scale. |
| Zod (validation) | Runtime type checking on API inputs. Catches malformed requests. |

---

## License

MIT
