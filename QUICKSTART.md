# 🚀 Gryork Quick Start Guide

Get the entire Gryork platform up and running in minutes.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 16+ and npm (or yarn)
- **MongoDB** 5.0+ (local or MongoDB Atlas)
- **Git**

## 🎯 Quick Setup (5 minutes)

### 1. Clone the Repository

```bash
cd /Users/apple/Desktop/Gryork\ New/Grylink
```

### 2. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gryork

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URLs
GRYLINK_FRONTEND_URL=http://localhost:5173
OFFICIAL_PORTAL_URL=http://localhost:5174
EOF

# Start backend server
npm run dev
```

Backend will run on **http://localhost:5000**

### 3. Set Up Frontend (GryLink Portal)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start frontend
npm run dev
```

Frontend will run on **http://localhost:5173**

### 4. Set Up Official Portal (Optional)

Open another terminal:

```bash
cd official_portal

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start portal
npm run dev
```

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
