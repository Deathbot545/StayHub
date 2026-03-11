# ⚛️ StayHub Frontend

**Modern React 19 + Vite frontend** for the StayHub vacation rental platform. Built with React Router for navigation, Context API for state management, and CSS modules for styling.

[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Latest-purple?logo=vite)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React%20Router-7.13.1-red)](https://reactrouter.com/)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (v22.4.1 recommended)
- npm v9+ or yarn
- Backend running on `http://localhost:5001`

### Installation & Setup

```bash
# Navigate to frontend directory
cd frontend/stayhub-frontend

# Install dependencies
npm install

# Start development server (hot reload enabled)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The frontend will be available at **http://localhost:5173**

---

## 📋 Project Structure

```
stayhub-frontend/
├── src/
│   ├── assets/                    # Static assets (images, fonts)
│   ├── components/
│   │   ├── Navbar.jsx            # Navigation bar with login/logout
│   │   ├── Navbar.css
│   │   ├── SearchBar.jsx          # Search/filter listings
│   │   ├── SearchBar.css
│   │   ├── Results.jsx            # Listing grid display
│   │   ├── Results.css
│   │   └── ProtectedRoute.jsx     # Role-based route protection
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Home.css
│   │   ├── SignIn.jsx            # Login page
│   │   ├── SignUp.jsx            # Registration page
│   │   ├── Auth.css              # Auth pages styling
│   │   ├── Listings.jsx          # Browse all listings
│   │   ├── Listings.css
│   │   ├── MyListings.jsx        # Host dashboard
│   │   └── MyListings.css
│   ├── lib/
│   │   ├── api.js                # API fetch wrapper
│   │   └── AuthContext.jsx       # Global auth state (Context API)
│   ├── App.jsx                   # Main app component
│   ├── App.css
│   ├── index.css                 # Global styles
│   └── main.jsx                  # Entry point
├── public/                        # Public assets
├── vite.config.js                # Vite configuration
├── eslint.config.js              # ESLint rules
├── index.html                    # HTML template
├── package.json
├── package-lock.json
└── README.md                     # This file
```

---

## 🔑 Core Features

### 🔐 Authentication System
- **Sign Up**: Create new account (Guest or Host role)
- **Sign In**: Login with email/password
- **JWT Token**: Auto-injected in all API requests
- **Token Storage**: Persisted in localStorage
- **Auto Logout**: Redirects to login on 401/403 errors
- **ProtectedRoute**: Restricts pages by user role

### 🏘️ Host Dashboard (MyListings.jsx)
- **Create Listings**: Form with real-time validation
- **Image Upload**: Drag-and-drop interface (max 3 images)
- **File Preview**: Shows selected images before publish
- **Publish**: Atomic upload (images + metadata together)
- **Edit Listings**: Update existing listings
- **Delete Listings**: Remove listings with confirmation
- **Status Management**: Toggle Live/Hidden status

### 🔍 Listing Discovery
- **Browse**: View all available listings
- **Search**: Filter by title, location, amenities
- **Listings Page**: Dedicated page for search results
- **Listing Details**: Full information with host details
- **Image Gallery**: Multi-image listing preview

### 🛣️ Navigation
- **Navbar**: Links to Home, Listings, MyListings (if host)
- **React Router**: SPA navigation without page reloads
- **Responsive**: Mobile-friendly navigation

---

## 🎨 Component Guide

### `Navbar.jsx`
Navigation menu with login/logout functionality.
```jsx
<Navbar />
```
**Features:**
- Links to Home, Listings
- Host dashboard link (if user is host)
- Logout button (if logged in)
- Login/Sign up links (if not logged in)

### `SearchBar.jsx`
Search and filter listings.
```jsx
<SearchBar onSearch={handleSearch} />
```
**Props:**
- `onSearch`: Callback with search parameters
- Search by location, price range, amenities

### `Results.jsx`
Grid display of listings.
```jsx
<Results listings={listings} />
```
**Props:**
- `listings`: Array of listing objects
- Shows 3 images per listing
- Clickable for details

### `ProtectedRoute.jsx`
Route wrapper for role-based access.
```jsx
<ProtectedRoute allowedRoles={["host", "admin"]}>
  <MyListings />
</ProtectedRoute>
```
**Props:**
- `allowedRoles`: Array of allowed user roles
- `children`: Component to protect
- Redirects to login if unauthorized

### `AuthContext.jsx`
Global authentication state management.
```jsx
const { user, token, login, logout } = useAuth();
```
**Methods:**
- `login(token, user)`: Store user session
- `logout()`: Clear session
- `isLoggedIn`: Boolean check
- `hasRole(role: string)`: Role checker

---

## 📡 API Integration

### API Wrapper (`lib/api.js`)
```javascript
import { apiFetch } from "@/lib/api";

const data = await apiFetch("/listings");
const response = await apiFetch("/listings", {
  method: "POST",
  body: JSON.stringify(payload),
});
```

**Features:**
- Auto-injects JWT token from localStorage
- Sets `Content-Type: application/json`
- Error handling with JSON parse
- Base URL: `/api` (proxied to backend)

### Multipart Requests (Image Upload)
```javascript
const formData = new FormData();
formData.append("title", "Cool Place");
formData.append("images", fileList[0]); // File object

const res = await fetch("/api/listings", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData, // Don't set Content-Type for multipart
});
```

---

## 🔀 Routing

### Public Routes
- `/` - Home (landing page)
- `/listings` - Browse all listings
- `/signin` - Login page
- `/signup` - Registration page

### Protected Routes
- `/my-listings` - Host dashboard (requires "host" role)

---

## 💾 State Management

### AuthContext
```jsx
const { user, token, login, logout } = useAuth();
```

**Stored in localStorage:**
```javascript
localStorage.stayhub_token = "eyJhbGciOiJIUzI1NiIs..."
localStorage.stayhub_user = '{"_id":"...","name":"John","role":"host"}'
```

### Component State (useState)
```jsx
const [listings, setListings] = useState([]);
const [selectedFiles, setSelectedFiles] = useState([]);
const [loading, setLoading] = useState(true);
```

---

## 🎯 User Flows

### Registration & Login
```
1. User visits /signup
2. Fills: name, email, password, role
3. Submits → POST /api/auth/signup
4. Backend returns JWT token + user object
5. Frontend stores in localStorage
6. Redirects to home page
7. Navbar shows "Logout" button
```

### Create Listing (Host)
```
1. Host navigates to /my-listings
2. Fills form: title, location, price, amenities
3. Drags images to upload zone (max 3)
4. Previews images before publish
5. Clicks "Publish Listing"
6. Frontend sends multipart POST to /api/listings
7. Backend uploads images to local/GCS storage
8. Returns listing with image URLs
9. New listing appears in dashboard
```

### Browse Listings (Guest)
```
1. User visits /listings
2. Searches/filters listings
3. Sees listing cards with images + host info
4. Clicks listing for details
5. Option to book (if implemented)
```

---

## 🛠️ Configuration

### Vite Config (`vite.config.js`)

**API Proxy:**
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
  '/uploads-local': {
    target: 'http://localhost:5001',
    changeOrigin: true,
  }
}
```

This allows:
- `/api/listings` → `http://localhost:5001/listings`
- `/uploads-local/listings/image.jpg` → `http://localhost:5001/uploads-local/listings/image.jpg`

---

## 🎨 Styling

### Approach
- **CSS Modules**: Each component has `.css` file
- **BEM Naming**: `.component-name`, `.component-name__element`
- **Responsive**: Mobile-first with media queries
- **No External UI Framework**: Pure CSS

### Global Styles (`index.css`)
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f5f5;
}
```

### Component Styles
```css
.host-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px;
}

.host-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .host-card {
    padding: 12px;
  }
}
```

---

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
```
- Hot Module Replacement (HMR)
- Source maps for debugging
- Unminified code for readability

### Production Build
```bash
npm run build
```
Creates optimized `dist/` folder:
- Minified JavaScript
- CSS modules bundled
- Assets optimized
- Tree-shaking enabled

### Preview Production Build
```bash
npm run preview
```
Serves built app from `dist/` on `http://localhost:4173`

### Deploy to Production
```bash
# Build
npm run build

# Upload dist/ folder to:
# - Vercel: https://vercel.com
# - Netlify: https://netlify.com
# - GitHub Pages: https://pages.github.com
# - AWS S3 + CloudFront
```

**Environment Variable for Production:**
Update `CLIENT_URL` in backend .env to your production frontend URL.

---

## 🐛 Common Issues & Solutions

### "Images not showing"
**Issue**: Listing images appear broken

**Solutions:**
1. Verify `/uploads-local` proxy in `vite.config.js`
2. Check backend is running on port 5001
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check browser DevTools Network tab for 404s

### "401 Unauthorized - login page keeps redirecting"
**Issue**: Can't stay logged in

**Solutions:**
1. Check localStorage: Open DevTools → Application → localStorage
2. Verify JWT token format: `xxx.yyy.zzz` (3 parts)
3. Backend may have restarted (expires tokens)
4. Clear localStorage and log in again

### "API requests failing"
**Issue**: Network errors when fetching listings

**Solutions:**
1. Verify backend is running: `http://localhost:5001`
2. Check vite.config.js proxy settings
3. Clear browser cache
4. Check browser console for CORS errors
5. Verify API routes in backend

### "Build failing"
**Issue**: `npm run build` errors

**Solutions:**
```bash
# Clear cache
rm -rf node_modules dist
npm install

# Try build again
npm run build
```

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.0 | UI library |
| react-dom | 19.2.0 | DOM rendering |
| react-router | 7.13.1 | Routing & navigation |
| vite | Latest | Build tool & dev server |

**Dev Dependencies:**
- @vitejs/plugin-react - Fast Refresh for React
- @eslint/js - Linting (optional)

---

## 🔐 Security Notes

✅ **Implemented**
- JWT tokens stored securely in localStorage
- Token validation before API calls
- Protected routes restrict unauthorized access
- Logout clears token from storage
- CORS proxy prevents direct backend exposure

⚠️ **To Improve**
- Implement refresh token rotation
- Add XSS protection headers
- Use Content Security Policy (CSP)
- Validate file uploads on frontend
- Never expose sensitive data in props

---

## 📞 Troubleshooting

### Port 5173 already in use
```bash
# Kill process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5173
kill -9 <PID>
```

### Dependencies conflict
```bash
npm ci  # Install exact versions from package-lock.json
```

### Hot reload not working
- Restart dev server: `npm run dev`
- Check if main.jsx and App.jsx are in src/

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Context API Guide](https://react.dev/reference/react/useContext)

---

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make changes following existing code style
3. Test thoroughly in dev environment
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

---

**Built with React & Vite** ⚛️⚡

---

*Last Updated: March 11, 2026*
