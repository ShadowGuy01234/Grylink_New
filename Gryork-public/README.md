# Gryork Public Website

Public-facing marketing website for Gryork - India's trusted bill discounting platform for infrastructure sub-contractors, EPCs, and NBFCs.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

## 📦 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:5176](http://localhost:5176) to view the website.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── about/             # About page
│   ├── how-it-works/      # How It Works page
│   ├── for-nbfc/          # NBFC partnership page
│   ├── for-epc/           # EPC contact page
│   ├── for-subcontractors/# Sub-contractor landing
│   ├── contact/           # Contact page
│   ├── careers/           # Careers page
│   ├── privacy/           # Privacy Policy
│   ├── terms/             # Terms of Service
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── layout/            # Header, Footer, Logo
│   ├── sections/          # Home page sections
│   └── ui/                # Reusable UI components
└── lib/
    ├── constants.ts       # Navigation, content data
    └── utils.ts           # Utility functions
```

## 🎨 Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue Dark | `#0A2463` | Headers, footer |
| Primary Blue Main | `#1E5AAF` | Primary buttons |
| Primary Blue Light | `#3B82F6` | Hover states |
| Accent Green | `#22C55E` | Secondary CTAs |
| Gray 600 | `#4B5563` | Body text |

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Home - Hero, Features, How It Works, Testimonials |
| `/about` | Company mission, values, journey |
| `/how-it-works` | Role-based step guides, FAQ |
| `/for-nbfc` | NBFC partnership info + application form |
| `/for-epc` | EPC benefits + contact form |
| `/for-subcontractors` | Sub-contractor benefits + getting started |
| `/contact` | General contact form |
| `/careers` | Open positions + company culture |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📝 License

Proprietary - Gryork © 2026
