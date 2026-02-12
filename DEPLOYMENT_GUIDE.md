# 🚀 Gryork Platform — Vercel Deployment Guide

> **Target Infrastructure**: Vercel (serverless) for all frontends + backend  
> **Last Updated**: February 12, 2026

---

## 📐 Architecture Overview

The Gryork monorepo contains **6 deployable services** (the `frontend/` directory is a legacy scaffold and is **not deployed**).

```
gryork-monorepo/
├── backend/             → Express.js API     → api.gryork.com       (Vercel Serverless Functions)
├── Gryork-public/       → Next.js 16         → gryork.com           (Vercel — native Next.js)
├── subcontractor-portal/→ Vite + React       → app.gryork.com       (Vercel — static SPA)
├── grylink-portal/      → Vite + React       → link.gryork.com      (Vercel — static SPA)
├── partner-portal/      → Vite + React       → partner.gryork.com   (Vercel — static SPA)
├── official_portal/     → Vite + React       → admin.gryork.com     (Vercel — static SPA)
└── frontend/            → (UNUSED — skip)
```

### Domain ↔ Service Mapping

| Domain | Service Dir | Framework | Vercel Project Type |
|---|---|---|---|
| `gryork.com` | `Gryork-public/` | Next.js 16 | **Framework: Next.js** |
| `api.gryork.com` | `backend/` | Express.js | **Serverless Functions** |
| `app.gryork.com` | `subcontractor-portal/` | Vite + React | **Framework: Vite** |
| `link.gryork.com` | `partner-portal/` | Vite + React | **Framework: Vite** |
| `partner.gryork.com` | `partner-portal/` | Vite + React | **Framework: Vite** |
| `admin.gryork.com` | `official_portal/` | Vite + React | **Framework: Vite** |

---

## 🏗️ Deployment Strategy — Each Service is a Separate Vercel Project

Since this is a monorepo, **each service gets its own Vercel project**. Vercel's "Root Directory" setting allows you to point each project at its subfolder within the same Git repo.

> [!IMPORTANT]
> You will create **6 separate Vercel projects**, all linked to the same Git repository, but each with a different **Root Directory**.

---

## 📦 Service-by-Service Deployment

### 1️⃣ Backend API → `api.gryork.com`

> [!CAUTION]
> The Express.js backend cannot run as-is on Vercel Serverless Functions. It requires a small adapter file and removing the `app.listen()` call when deployed serverlessly.

#### What to do

1. **Create `backend/api/index.js`** — Vercel expects a function entry point at `api/index.js`:

```js
// backend/api/index.js
const app = require('../index'); // your Express app

module.exports = app;
```

2. **Modify `backend/index.js`** — Only start the server when NOT on Vercel:

```js
// At the very bottom, replace app.listen(...) with:
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export the app for Vercel Serverless Functions
module.exports = app;
```

3. **Create `backend/vercel.json`**:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

4. **Handle Cron Jobs** — Consolidate all jobs into a single file to stay within Vercel Hobby limits (max 2 jobs, daily frequency).

   Create `backend/api/cron/all_tasks.js`:
   ```js
   const {
     markDormantSubContractors,
     checkOverdueNotifications,
     checkActualOverdue,
     checkSlaReminders,
     checkKycExpiry,
   } = require('../../config/cronJobs');

   module.exports = async (req, res) => {
     if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
       return res.status(401).json({ error: 'Unauthorized' });
     }

     try {
       const results = {
         dormant: await markDormantSubContractors(),
         overdue: await checkOverdueNotifications(),
         actualOverdue: await checkActualOverdue(),
         slaReminders: await checkSlaReminders(), // Daily check
         kycExpiry: await checkKycExpiry(),       // Daily check (low overhead)
       };
       res.json({ success: true, results });
     } catch (error) {
       console.error('[CRON] Error:', error);
       res.status(500).json({ error: error.message });
     }
   };
   ```

   Add to `backend/vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/all_tasks",
         "schedule": "0 0 * * *"
       }
     ]
   }
   ```

#### Environment Variables (set in Vercel Dashboard)

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://...` (MongoDB Atlas connection string) |
| `JWT_SECRET` | Strong random 64+ char string |
| `JWT_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `EMAIL_HOST` | `smtp.gmail.com` (or SendGrid) |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your email |
| `EMAIL_PASS` | App password |
| `EMAIL_FROM` | `Gryork <noreply@gryork.com>` |
| `PUBLIC_SITE_URL` | `https://gryork.com` |
| `SUBCONTRACTOR_PORTAL_URL` | `https://app.gryork.com` |
| `GRYLINK_PORTAL_URL` | `https://link.gryork.com` |
| `PARTNER_PORTAL_URL` | `https://partner.gryork.com` |
| `ADMIN_PORTAL_URL` | `https://admin.gryork.com` |
| `CRON_SECRET` | Random secret to protect cron endpoints |
| `VERCEL` | `1` (auto-set by Vercel) |

#### Vercel Project Settings

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Framework Preset | Other |
| Build Command | _(leave empty — no build step)_ |
| Output Directory | _(leave empty)_ |
| Install Command | `npm install` |

---

### 2️⃣ Public Website → `gryork.com`

This is a **Next.js 16** app — Vercel's native framework. Simplest deployment.

#### Vercel Project Settings

| Setting | Value |
|---|---|
| Root Directory | `Gryork-public` |
| Framework Preset | **Next.js** |
| Build Command | `next build` |
| Output Directory | _(auto — `.next`)_ |
| Install Command | `npm install` |

#### Environment Variables

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://gryork.com` |
| `NEXT_PUBLIC_API_URL` | `https://api.gryork.com/api` |
| `NEXT_PUBLIC_APP_URL` | `https://app.gryork.com` |
| `NEXT_PUBLIC_GRYLINK_URL` | `https://link.gryork.com` |
| `NEXT_PUBLIC_PARTNER_URL` | `https://partner.gryork.com` |
| `NEXT_PUBLIC_ADMIN_URL` | `https://admin.gryork.com` |

---

### 3️⃣ Subcontractor Portal → `app.gryork.com`

#### Vercel Project Settings

| Setting | Value |
|---|---|
| Root Directory | `subcontractor-portal` |
| Framework Preset | **Vite** |
| Build Command | `tsc -b && vite build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

#### Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://api.gryork.com/api` |

#### SPA Routing — Create `subcontractor-portal/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 4️⃣ GryLink Portal → `link.gryork.com`

#### Vercel Project Settings

| Setting | Value |
|---|---|
| Root Directory | `grylink-portal` |
| Framework Preset | **Vite** |
| Build Command | `tsc -b && vite build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

#### Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://api.gryork.com/api` |

#### SPA Routing — Create `grylink-portal/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 5️⃣ Partner Portal → `partner.gryork.com`

#### Vercel Project Settings

| Setting | Value |
|---|---|
| Root Directory | `partner-portal` |
| Framework Preset | **Vite** |
| Build Command | `tsc -b && vite build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

#### Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://api.gryork.com/api` |

#### SPA Routing — Create `partner-portal/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 6️⃣ Admin Portal → `admin.gryork.com`

#### Vercel Project Settings

| Setting | Value |
|---|---|
| Root Directory | `official_portal` |
| Framework Preset | **Vite** |
| Build Command | `tsc -b && vite build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

#### Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://api.gryork.com/api` |

#### SPA Routing — Create `official_portal/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🌐 Domain Configuration

### DNS Records (on your domain registrar, e.g. GoDaddy, Namecheap, Cloudflare)

| Type | Name | Value | Purpose |
|---|---|---|---|
| `CNAME` | `@` | `cname.vercel-dns.com` | Root domain → Gryork-public |
| `CNAME` | `www` | `cname.vercel-dns.com` | www redirect |
| `CNAME` | `api` | `cname.vercel-dns.com` | Backend API |
| `CNAME` | `app` | `cname.vercel-dns.com` | Subcontractor Portal |
| `CNAME` | `link` | `cname.vercel-dns.com` | GryLink Portal |
| `CNAME` | `partner` | `cname.vercel-dns.com` | Partner Portal |
| `CNAME` | `admin` | `cname.vercel-dns.com` | Admin Portal |

> [!NOTE]
> After adding DNS records, add each custom domain in the corresponding Vercel project's **Settings → Domains** panel. Vercel will auto-provision SSL certificates.

---

## ✅ Pre-Deployment Checklist

### Code Changes Required

- [ ] **`backend/index.js`** — Wrap `app.listen()` in `if (!process.env.VERCEL)` guard and add `module.exports = app`
- [ ] **`backend/api/index.js`** — Create Vercel serverless entry point
- [ ] **`backend/vercel.json`** — Create with routes + cron config
- [ ] **`backend/config/cronJobs.js`** — Skip `initializeCronJobs()` when on Vercel (crons will be HTTP-triggered)
- [ ] **`subcontractor-portal/vercel.json`** — Create with SPA rewrite
- [ ] **`grylink-portal/vercel.json`** — Create with SPA rewrite
- [ ] **`partner-portal/vercel.json`** — Create with SPA rewrite
- [ ] **`official_portal/vercel.json`** — Create with SPA rewrite
- [ ] Remove `gryork-monorepo: "file:.."` from `dependencies` in all package.json files (Vercel can't resolve `file:..` linked deps — extract shared code to an npm package or inline it)

### External Services

- [ ] **MongoDB Atlas** — Have your production cluster ready (free tier M0 works to start)
  - Whitelist `0.0.0.0/0` for IP access (Vercel uses dynamic IPs) or use Vercel's [Secure Compute](https://vercel.com/docs/security/secure-compute) with static IPs
- [ ] **Cloudinary** — Verify production credentials
- [ ] **SMTP / Email** — Verify email provider credentials; consider SendGrid or Resend for production
- [ ] **Custom Domain** — Purchase and configure `gryork.com`

### Vercel Account

- [ ] Sign up at [vercel.com](https://vercel.com) (Pro plan recommended for teams — $20/user/mo)
- [ ] Connect your GitHub/GitLab repo
- [ ] Pro plan gives you: 100GB bandwidth, serverless function execution time, Vercel Cron Jobs

---

## 🔄 Step-by-Step Deployment Order

### Phase 1: Code Prep
1. Make all code changes from the checklist above
2. Remove or handle `file:..` workspace dependencies
3. Ensure each service builds successfully locally:
   ```bash
   cd Gryork-public && npm run build
   cd subcontractor-portal && npm run build
   cd grylink-portal && npm run build
   cd partner-portal && npm run build
   cd official_portal && npm run build
   ```
4. Push all changes to `main` branch

### Phase 2: Create Vercel Projects (in this order)
1. **Backend API** (`api.gryork.com`) — Deploy first, the frontends need the API URL
2. **Gryork Public** (`gryork.com`) — Main website
3. **Subcontractor Portal** (`app.gryork.com`)
4. **GryLink Portal** (`link.gryork.com`)
5. **Partner Portal** (`partner.gryork.com`)
6. **Admin Portal** (`admin.gryork.com`)

For each:
1. Go to Vercel Dashboard → **Add New → Project**
2. Import from Git repo
3. Set **Root Directory** to the service folder
4. Set **Framework Preset** as indicated above
5. Add all **Environment Variables**
6. Click **Deploy**

### Phase 3: Domain Setup
1. Add custom domain to each project in Vercel
2. Configure DNS records on your registrar
3. Wait for SSL provisioning (usually < 5 min)

### Phase 4: Verify
1. Hit `https://api.gryork.com/api/health` — should return `{"status":"OK"}`
2. Visit `https://gryork.com` — public website loads
3. Visit each portal subdomain — check console for CORS / API errors
4. Test a login flow end-to-end
5. Trigger a cron endpoint manually to verify

---

## ⚠️ Important Serverless Considerations

### Cold Starts
Vercel Serverless Functions have **cold starts** (~250ms–1s). For the backend API:
- MongoDB connections are re-established on each cold start — use connection caching:
  ```js
  // In config/db.js, cache the connection
  let cachedDb = null;
  const connectDB = async () => {
    if (cachedDb) return cachedDb;
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    cachedDb = conn;
    return conn;
  };
  ```

### File Uploads
- `multer` with disk storage won't work on Vercel (read-only filesystem except `/tmp`)
- Your current setup uses **Cloudinary storage** (`multer-storage-cloudinary`), which is ✅ compatible

### Execution Limits
- **Hobby Plan**: 10s max execution per function
- **Pro Plan**: 60s max execution (sufficient for most API calls)
- If cron jobs perform heavy DB operations, ensure they complete within the timeout

### Cron Jobs (Vercel Cron)
- **Hobby Plan**: Max 2 cron jobs, once daily minimum
- **Pro Plan**: Unlimited crons, down to every minute
- Crons are triggered via HTTP with `CRON_SECRET` for auth

---

## 🗂️ Summary Matrix

| Service | Deploy As | Root Dir | Custom Domain | Framework |
|---|---|---|---|---|
| Backend API | Serverless Functions | `backend` | `api.gryork.com` | Express.js via `@vercel/node` |
| Public Website | SSR/SSG Next.js | `Gryork-public` | `gryork.com` | Next.js 16 |
| Subcontractor Portal | Static SPA | `subcontractor-portal` | `app.gryork.com` | Vite + React |
| GryLink Portal | Static SPA | `grylink-portal` | `link.gryork.com` | Vite + React |
| Partner Portal | Static SPA | `partner-portal` | `partner.gryork.com` | Vite + React |
| Admin Portal | Static SPA | `official_portal` | `admin.gryork.com` | Vite + React |

---

## 🚑 Rollback

Each Vercel project has **instant rollback** — click on any previous deployment in the Vercel Dashboard and promote it to production. No `git revert` necessary.

---

## 💰 Expected Costs (Vercel Pro Plan)

| Item | Cost |
|---|---|
| Vercel Pro | $20/user/month |
| MongoDB Atlas (M0) | Free |
| MongoDB Atlas (M10+) | ~$57/month |
| Cloudinary (Free tier) | Free up to 25 credits |
| Custom Domain | ~$10–15/year |
| **Total (Startup)** | **~$20–80/month** |
