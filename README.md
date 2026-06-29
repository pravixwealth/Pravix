# Pravix — Intelligent Wealth Management Platform

Pravix is a modern wealth management platform that combines AI-powered financial guidance with real-time market intelligence. Built for Indian investors who want personalized, data-driven investment strategies.

**Live:** [pravix.in](https://pravix.in)

---

## Features

- **AI Financial Advisor** — Personalized investment guidance tailored to Indian tax regimes and financial instruments
- **Real-Time Market Data** — Live Nifty, Sensex, and Bank Nifty tracking with portfolio-relevant insights
- **Smart Dashboard** — Portfolio overview, holdings analysis, and allocation visualization
- **Goal-Based Onboarding** — Structured questionnaire that builds a financial profile and investment plan
- **Investment Calculators** — SIP calculator, wealth planning tool, and financial planning instruments
- **Discovery Call Booking** — Integrated scheduling for one-on-one advisory sessions
- **Learning Hub** — Educational content on investing, markets, and financial planning

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Frontend | React 19, Tailwind CSS 4, Framer Motion |
| Backend | Next.js API Routes, Supabase (PostgreSQL + Auth + RLS) |
| AI/ML | OpenRouter (GPT-4o), NVIDIA NIM (LLaMA 3.1) |
| Deployment | Vercel (Edge + Serverless) |
| Charts | Recharts |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/pravixwealth/Pravix.git
cd Pravix
npm install
```

### Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features |
| `NVIDIA_API_KEY` | NVIDIA NIM API key |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm run start
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (agent, auth, market, booking)
│   ├── dashboard/          # User dashboard
│   ├── onboarding/         # Goal-based onboarding flow
│   ├── services/           # Service offerings
│   ├── learn/              # Educational content
│   └── ...
├── components/             # Reusable UI components
└── lib/                    # Utilities, Supabase client, helpers
```

---

## Deployment

Deployed on [Vercel](https://vercel.com) with automated CI/CD from the `main` branch.

```bash
npm run build
```

---

## License

Proprietary. All rights reserved by Pravix Wealth.
