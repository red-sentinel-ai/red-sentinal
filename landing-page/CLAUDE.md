# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the landing page for Sui Sentinel, a decentralized AI security platform built on the Sui blockchain. The landing page showcases the product, handles manifesto signatures, job applications, and hosts a blog.

## Commands

```bash
# Development (uses Turbopack)
yarn dev

# Production build
yarn build

# Start production server
yarn start

# Lint
yarn lint

# Generate Supabase types (requires .env.production with SUPABASE_PROJECT_REF)
yarn generate:types:prod
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router (React 19)
- **Styling**: Tailwind CSS v4 with shadcn/ui (new-york style)
- **Database**: Supabase (PostgreSQL)
- **Email**: AWS SES for transactional emails
- **Analytics**: Vercel Analytics
- **Font**: Satoshi (local variable font)

### Directory Structure

```
app/                    # Next.js App Router pages
├── api/               # API routes
│   ├── apply/         # Job application submissions
│   └── manifesto/     # Manifesto signature endpoints
├── blog/              # Blog pages (uses markdown files)
├── brand-kit/         # Brand assets page
├── careers/           # Careers/job listings
└── page.tsx           # Main landing page (client component)

components/
├── modals/            # Modal components (JobApplication, Manifesto)
└── sections/          # Page sections (Hero, HowItWorks, etc.)

lib/
├── blogUtils.ts       # Markdown blog processing (gray-matter, remark)
├── database.types.ts  # Auto-generated Supabase types
├── emailUtils.ts      # AWS SES email templates
└── utils.ts           # Tailwind cn() helper

db/config/
└── server.ts          # Supabase service client

constants/
└── index.ts           # App URLs, feature flags, static content

blogs/                 # Markdown blog posts with frontmatter
```

### Key Patterns

**Import Aliases**: Use `@/` for absolute imports (configured in tsconfig.json)

**Supabase Tables Used**:
- `ss_manifesto_signatures` - Manifesto email signatures
- `ss_job_applications` - Job application submissions with resume storage

**Blog System**: Markdown files in `/blogs` with frontmatter (title, date, description, author, image, tags). Processed using gray-matter and remark.

**shadcn/ui Configuration**: Uses new-york style with Lucide icons. Components go in `components/ui/`, utils in `lib/utils.ts`.

## Environment Variables

Required variables (see `environment.d.ts`):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `SUPABASE_PROJECT_REF` - Project reference for type generation

For email functionality:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_FROM_EMAIL`
