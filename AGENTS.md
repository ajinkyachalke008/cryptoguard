## Project Summary
CryptoGuard is an AI-powered crypto fraud detection and risk analysis platform. It features a futuristic, premium interface with 3D globe visualizations of real-time transactions, comprehensive wallet/transaction scanning, and advanced forensics like behavioral fingerprinting, trust timelines, and AI-driven risk explanations.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Turso (SQLite) with Drizzle ORM
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **Visualizations**: Three.js / react-globe.gl, D3.js (for graphs)
- **Authentication**: Custom JWT-based auth with Supabase Auth capability
- **API**: OpenAI-compatible LLM integration for risk analysis

## Architecture
- `src/app`: Page routes and layouts
- `src/app/api`: Backend API routes (RESTful)
- `src/components`: Reusable UI components (shadcn/ui based)
- `src/lib/services`: Business logic (AI, Risk Engine, Web3 data)
- `src/lib/middleware`: Auth, Rate Limiting, Error handling
- `src/db`: Database schema and connection logic

## User Preferences
- **Theme**: Default is Dark (Black + Neon Gold).
- **Admin Emails**: Hard-coded whitelist restricted to `ajinkyachalke008@gmail.com` and `ajinkyachalke94@gmail.com`.
- **Styling**: Prefers glassmorphism, glowing highlights, and high-impact futuristic aesthetics.

## Project Guidelines
- **Hard-coded Security**: Admin access is enforced at the backend level via middleware and JWT role assignment.
- **Mock Fallbacks**: Most features include robust mock data fallbacks to ensure functional demos without live API keys.
- **Cleanliness**: Ensure no duplicate pages (e.g., use `/pattern-matching` instead of `/pattern-matcher`).
- **Voice AI**: Navbar includes a Mic button that opens a simulated voice interaction modal.

## Common Patterns
- **API Integration**: Use standard fetch with proper error handling and toast notifications.
- **Components**: Use functional components with `lucide-react` for icons and `framer-motion` for animations.
- **Risk Scoring**: Follow the defined risk levels (0-29 Low, 30-59 Medium, 60-79 High, 80-100 Critical).
