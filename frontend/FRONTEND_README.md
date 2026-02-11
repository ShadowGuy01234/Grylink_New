# GryLink Frontend - Enhanced UI/UX

A modern, comprehensive React-based frontend for the Gryork B2B Supply Chain Financing Platform.

## 🎨 Features

### Enhanced User Interface
- **Modern Design System**: Dark theme with custom CSS variables
- **Responsive Layout**: Mobile-first design that works on all screen sizes
- **Reusable Components**: Modular component library for consistency

### Core Pages
1. **Home Page**: Marketing landing page with platform features
2. **Login Page**: Secure authentication for all user roles
3. **Onboarding Page**: GryLink invitation-based registration
4. **EPC Dashboard**: Comprehensive dashboard for companies
5. **Sub-Contractor Dashboard**: Complete interface for vendors

### Component Library

#### UI Components
- **Card**: Flexible card component with optional headers and actions
- **Button**: Multiple variants (primary, secondary, success, danger, warning, ghost)
- **Badge**: Status badges with automatic color mapping
- **Modal**: Responsive modal with size options (sm, md, lg, xl)
- **Table**: Data table with custom column rendering
- **StatCard**: Statistics display card with icons and trends
- **FileUpload**: Drag-and-drop file upload with preview

#### Layout Components
- **Layout**: Top navigation bar with user info and logout
- **AuthContext**: Global authentication state management

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── index.ts              # API client with all endpoints
│   ├── assets/                   # Static assets
│   ├── components/
│   │   ├── Badge.tsx            # Status badge component
│   │   ├── Button.tsx           # Button with variants
│   │   ├── Card.tsx             # Card container
│   │   ├── FileUpload.tsx       # File upload with drag-drop
│   │   ├── Layout.tsx           # Main layout wrapper
│   │   ├── Modal.tsx            # Modal dialog
│   │   ├── StatCard.tsx         # Statistics card
│   │   └── Table.tsx            # Data table
│   ├── context/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── pages/
│   │   ├── EpcDashboardNew.tsx       # EPC dashboard
│   │   ├── HomePage.tsx              # Landing page
│   │   ├── LoginPage.tsx             # Login page
│   │   ├── OnboardingPage.tsx        # Onboarding flow
│   │   └── SubContractorDashboardNew.tsx  # SC dashboard
│   ├── App.css                  # App-level styles
│   ├── App.tsx                  # Main app component
│   ├── index.css                # Global styles & theme
│   └── main.tsx                 # App entry point
├── package.json
├── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:5000` (or configure `VITE_API_URL`)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## 🔧 Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 Dashboard Features

### EPC Dashboard
- **Overview Tab**: Quick view of pending actions and active cases
- **Documents Tab**: Upload and manage company documents
- **Sub-Contractors Tab**: Add/manage vendors, bulk upload via Excel
- **Cases Tab**: Review bills, place bids, track case status

Key Actions:
- Upload company documents (CIN, GST, PAN, etc.)
- Add sub-contractors individually or via bulk Excel upload
- Review and approve/reject bills
- Place competitive bids on verified cases

### Sub-Contractor Dashboard
- **Overview Tab**: Pending bids and verified bills
- **Profile Tab**: Complete business profile
- **Bills Tab**: Upload and track bill status
- **Bids & CWC Tab**: Review bids, submit CWC requests

Key Actions:
- Complete company profile
- Upload bills with supporting documents
- Submit CWC (Cash against Work Certificate) requests
- Accept or reject financing bids

## 🎨 Design System

### Color Palette
```css
--bg-primary: #0d1117      /* Main background */
--bg-secondary: #161b22    /* Card/section background */
--bg-card: #21262d         /* Card background */
--accent: #58a6ff          /* Primary accent color */
--success: #3fb950         /* Success states */
--warning: #d29922         /* Warning states */
--danger: #f85149          /* Error states */
--purple: #bc8cff          /* Secondary accent */
```

### Typography
- Font Family: Inter (Google Fonts)
- Weights: 300, 400, 500, 600, 700

### Components Styling
All components follow a consistent design pattern with:
- Dark theme by default
- Smooth transitions (0.15s - 0.3s)
- Border radius: 8px (normal), 12px (large)
- Consistent spacing: 8px, 12px, 16px, 24px, 32px

## 🔐 Authentication Flow

1. **Public Routes**: Home, Login, Onboarding (token-based)
2. **Protected Routes**: All dashboards require authentication
3. **Role-Based Access**: Routes filtered by user role (epc/subcontractor)

### Token Management
- JWT tokens stored in localStorage
- Automatic token refresh on 401 responses
- Auto-redirect to login on auth failure

## 🌐 API Integration

All API calls are centralized in `src/api/index.ts`:

```typescript
// Auth APIs
authApi.login(credentials)
authApi.getMe()

// Company APIs
companyApi.getProfile()
companyApi.uploadDocuments(formData)
companyApi.addSubContractors(data)

// Sub-Contractor APIs
subContractorApi.updateProfile(data)
subContractorApi.uploadBills(formData)
subContractorApi.submitCwc(data)

// Cases & Bids
casesApi.getCases()
bidsApi.placeBid(data)
```

## 📱 Responsive Design

- **Desktop**: Full feature set, sidebar navigation
- **Tablet**: Optimized layouts, collapsible sections
- **Mobile**: Touch-friendly, simplified navigation

Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## ⚡ Performance

- **Code Splitting**: Route-based lazy loading
- **Tree Shaking**: Vite automatically removes unused code
- **Asset Optimization**: Images and fonts optimized
- **Caching**: API responses cached where appropriate

## 🧪 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style
- TypeScript for type safety
- React Hooks for state management
- Functional components throughout
- PropTypes via TypeScript interfaces

## 🚧 Future Enhancements

Potential improvements to consider:
- [ ] Real-time notifications using WebSockets
- [ ] Advanced filtering and search
- [ ] Export data to CSV/PDF
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Document preview in-app
- [ ] Chat/messaging system

## 🐛 Troubleshooting

### Common Issues

**401 Unauthorized**
- Check if backend is running
- Verify API_URL configuration
- Clear localStorage and re-login

**Components not rendering**
- Verify all dependencies installed: `npm install`
- Check console for errors
- Ensure proper import paths

**Styling issues**
- Clear browser cache
- Check if index.css is imported in main.tsx
- Verify Tailwind CSS setup (if using)

## 📝 License

Copyright © 2026 Gryork. All rights reserved.

---

**Built with** ❤️ **using React + TypeScript + Vite**
