# TatBook — Tattoo Artist Booking Platform

A full-stack Next.js application for tattoo artists to accept bookings from clients. Artists can manage flash designs, customize booking forms, connect Google Calendar, and collect deposits via Stripe.

## Features

- **Artist accounts** — Register as an artist, build a public profile with portfolio images, bio, location, and Instagram link
- **Flash tattoo bookings** — Upload flash designs with images, set prices, toggle availability; clients browse and select designs when booking
- **Custom tattoo bookings** — Clients upload up to 3 reference images and describe their concept
- **Conditional booking form** — Clients choose Flash or Custom; the form adapts accordingly
- **Artist form customization** — Artists customize size options (with optional pricing), body placement choices, and add extra form questions (text, textarea, dropdown)
- **Stripe deposit collection** — Deposits charged via Stripe Checkout when a client submits a booking; webhook confirms payment
- **Google Calendar integration** — Artists connect their Google Calendar via OAuth; confirmed appointments are automatically added as calendar events with client attendee invites
- **Artist dashboard** — Overview stats, booking management with expand/collapse details, calendar view, flash design manager, and settings

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma (swap to Postgres for production)
- **Auth**: NextAuth.js v5 (credentials + Google OAuth)
- **Payments**: Stripe Checkout
- **Calendar**: Google Calendar API
- **Forms**: React Hook Form + Zod

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in all values in `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path (default: `file:./dev.db`) |
| `AUTH_SECRET` | Random secret ≥ 32 chars — run `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (from Stripe Dashboard) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. `http://localhost:3000`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (for reference image uploads) |

### 3. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable the **Google Calendar API**
3. Create OAuth 2.0 credentials with redirect URI:
   `http://localhost:3000/api/calendar/callback`
4. Copy Client ID and Secret to `.env`

### 4. Set up Stripe

1. Create a [Stripe account](https://stripe.com)
2. Copy your test API keys to `.env`
3. For webhooks in development, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Initialize the database

```bash
npm run db:push    # Apply schema to database
npm run db:seed    # Seed demo data (optional)
```

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Artist | artist@demo.com | password123 |
| Client | client@demo.com | password123 |

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/        # Login page
│   ├── (auth)/register/     # Registration page (artist or client)
│   ├── artist/[id]/         # Public artist profile
│   ├── artist/dashboard/    # Artist dashboard (protected)
│   │   ├── bookings/        # Booking management
│   │   ├── calendar/        # Calendar view + Google connect
│   │   ├── flash/           # Flash design manager
│   │   └── settings/        # Profile & form customization
│   ├── artists/             # Browse all artists
│   ├── book/[artistId]/     # Client booking flow
│   │   └── confirmation/    # Post-payment confirmation
│   └── api/
│       ├── auth/            # NextAuth routes
│       ├── artists/         # Artist CRUD
│       ├── bookings/        # Booking CRUD
│       ├── flash/           # Flash design CRUD
│       ├── calendar/        # Google Calendar OAuth + availability
│       ├── stripe/webhook   # Stripe webhook handler
│       └── upload/          # Reference image upload (Cloudinary)
├── components/
│   ├── booking/             # BookingForm, FlashBookingSection, CustomBookingSection
│   ├── artist/              # BookingsManager, FlashDesignManager, ArtistSettingsForm
│   ├── calendar/            # CalendarView, ConnectCalendarButton
│   └── layout/              # Header, DashboardSidebar
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── prisma.ts            # Prisma client singleton
│   ├── stripe.ts            # Stripe helpers
│   ├── google-calendar.ts   # Google Calendar OAuth + API helpers
│   └── utils.ts             # cn(), formatCurrency(), formatDate()
└── types/index.ts           # Shared TypeScript types
```

## Deploying to Production

1. Switch `DATABASE_URL` to a Postgres connection string in `.env`
2. Update `datasource db { provider = "postgresql" }` in `prisma/schema.prisma`
3. Run `npm run db:migrate` to apply migrations
4. Set all env vars in your hosting platform (Vercel, Railway, etc.)
5. Add your production domain to Stripe's webhook endpoints
6. Add your production callback URL to Google OAuth credentials
