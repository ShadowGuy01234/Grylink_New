# 🚀 Gryork Quick Start Guide

Get the entire Gryork platform up and running in minutes.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm (or yarn)
- **MongoDB** 5.0+ (local or MongoDB Atlas)
- **Git**

## 🌐 Platform Architecture

| Portal | Directory | Port | URL (Dev) | Purpose |
|--------|-----------|------|-----------|---------|
| Public Site | `Gryork-public/` | 5176 | http://localhost:5176 | Marketing website |
| SubContractor | `subcontractor-portal/` | 5173 | http://localhost:5173 | Sub-contractor dashboard |
| GryLink | `grylink-portal/` | 5174 | http://localhost:5174 | Magic link onboarding |
| Partner | `partner-portal/` | 5175 | http://localhost:5175 | EPC/NBFC dashboard |
| Admin | `official_portal/` | 5177 | http://localhost:5177 | Internal admin |
| Backend | `backend/` | 5000 | http://localhost:5000 | API server |

## 🎯 Quick Setup

### 1. Set Up Backend

```powershell
cd backend
npm install

# Copy .env.example to .env and configure
copy .env.example .env
# Edit .env with your MongoDB URI, Cloudinary keys, etc.

npm run dev
```

Backend API runs on **http://localhost:5000**

### 2. Set Up Portals (Choose what you need)

**SubContractor Portal (port 5173):**
```powershell
cd subcontractor-portal
npm install
npm run dev
```

**GryLink Onboarding Portal (port 5174):**
```powershell
cd grylink-portal
npm install
npm run dev
```

**Partner Portal - EPC/NBFC (port 5175):**
```powershell
cd partner-portal
npm install
npm run dev
```

**Public Website (port 5176):**
```powershell
cd Gryork-public
npm install
npm run dev
```

**Admin Portal (port 5177):**
```powershell
cd official_portal
npm install
npm run dev
```

### 3. Environment Variables

Each portal needs a `.env` file with at minimum:

```env
VITE_API_URL=http://localhost:5000/api
VITE_PUBLIC_SITE_URL=http://localhost:5176
```

See `.env.example` in each directory for full configuration.

---

## 🔑 Test Accounts

After running the seed script (`npm run seed` in backend/), use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gryork.com | password123 |
| Sales | sales@gryork.com | password123 |
| Ops | ops@gryork.com | password123 |
| EPC | epc@example.com | password123 |
| SubContractor | sc@example.com | password123 |

---

## 📱 User Flows

### Sub-Contractor Flow
1. Go to http://localhost:5173 (subcontractor-portal)
2. Register new account or login
3. Complete profile
4. Upload bills
5. Track case status

### EPC/NBFC Partner Flow
1. Receive GryLink email
2. Go to http://localhost:5174 (grylink-portal)
3. Complete onboarding → Redirected to partner-portal
4. Login at http://localhost:5175
5. Upload documents, manage sub-contractors, place bids

### Admin Flow
1. Go to http://localhost:5177 (official_portal)
2. Login with sales/ops/admin credentials
3. Manage leads, verify documents, process cases

---

Official Portal will run on **http://localhost:5174**

## 🎉 You're Ready!

Your Gryork platform is now running:

- **GryLink Portal**: http://localhost:5173 (EPCs & Sub-Contractors)
- **Official Portal**: http://localhost:5174 (Sales & Ops teams)
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

## 👤 Create Your First User

### Option 1: Via API (Postman/cURL)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Admin",
    "email": "sales@gryork.com",
    "password": "password123",
    "phone": "+91 9876543210",
    "role": "sales"
  }'
```

### Option 2: Via MongoDB

```bash
# Connect to MongoDB
mongosh gryork

# Create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@gryork.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIIHhRzTni", // "password123" hashed
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Default password: `password123`

## 🧪 Test the System

### 1. Test Backend API
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"OK","timestamp":"..."}
```

### 2. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gryork.com","password":"password123"}'
# Expected: {"user":{...},"token":"..."}
```

### 3. Open Frontend
Visit http://localhost:5173 - you should see the home page

### 4. Login to System
- Go to http://localhost:5173/login
- Email: `admin@gryork.com`
- Password: `password123`

## 📚 Next Steps

### Create Test Data

#### 1. Create a Sales User (Official Portal)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Sales",
    "email": "john@sales.gryork.com",
    "password": "password123",
    "role": "sales"
  }'
```

#### 2. Create Company Lead
Login to Official Portal (http://localhost:5174) as sales user and create a company lead.

#### 3. Complete Onboarding Flow
- Check email for GryLink URL
- Set password
- Upload documents
- Add sub-contractors
- Upload bills
- Place bids

### Seed Database (Optional)

If you want to quickly populate the database with test data:

```bash
cd backend
node scripts/seedUsers.js
```

This will create sample users for all roles.

## 🐛 Troubleshooting

### Backend won't start
- **Check MongoDB**: Ensure MongoDB is running
  ```bash
  # macOS with Homebrew
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongod
  
  # Windows
  net start MongoDB
  ```
- **Check .env**: Verify all required environment variables
- **Check port**: Ensure port 5000 is not in use

### Frontend won't start
- **Clear cache**: Delete `node_modules` and reinstall
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- **Check port**: Ensure port 5173/5174 is not in use
- **Check API URL**: Verify VITE_API_URL in .env

### 401 Unauthorized Errors
- **Clear auth**: Clear localStorage and re-login
- **Check token**: JWT_SECRET must match backend
- **Check API**: Ensure backend is running

### File Upload Errors
- **Cloudinary**: Configure Cloudinary credentials
- **Temporary fix**: Comment out Cloudinary validation for local dev

### Database Connection Errors
- **MongoDB URI**: Check MONGODB_URI in .env
- **MongoDB running**: Verify MongoDB service is active
- **Network**: Check firewall/security settings

## 🔧 Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- TypeScript Vue Plugin
- MongoDB for VS Code
- REST Client

### Browser Extensions
- React Developer Tools
- Redux DevTools (if using Redux)
- JSON Formatter

### API Testing
- **Postman**: Import API collection
- **Thunder Client**: VS Code extension
- **cURL**: Command line

## 📖 Additional Resources

- **System Architecture**: `/SYSTEM_ARCHITECTURE.md`
- **Frontend Guide**: `/frontend/FRONTEND_README.md`
- **Backend README**: `/backend/README.md`
- **Workflow Documentation**: `/doc/workflow.md`

## 🤝 Need Help?

- Check the documentation files
- Review the codebase comments
- Inspect browser console for errors
- Check backend logs for API errors

## 🎨 Customization

### Change Theme Colors
Edit `/frontend/src/index.css` CSS variables:
```css
:root {
  --accent: #58a6ff;  /* Change primary color */
  --success: #3fb950;
  --danger: #f85149;
}
```

### Add New API Endpoints
1. Create route in `/backend/routes/`
2. Add service logic in `/backend/services/`
3. Update API client in `/frontend/src/api/index.ts`

### Add New Pages
1. Create component in `/frontend/src/pages/`
2. Add route in `/frontend/src/App.tsx`
3. Update navigation in `/frontend/src/components/Layout.tsx`

---

**Happy Coding!** 🚀

If you encounter any issues, refer to the detailed documentation or create an issue in the repository.
