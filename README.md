# 🏡 StayHub - Airbnb Clone Platform

A full-stack MERN (MongoDB, Express, React, Node.js) application for Sri Lanka vacation rental management. StayHub enables users to discover, book, and list accommodations with a seamless, modern interface.

[![Node.js](https://img.shields.io/badge/Node.js-22.4.1-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Express](https://img.shields.io/badge/Express-5.x-black?logo=express)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-Latest-purple?logo=vite)](https://vitejs.dev/)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based user authentication with **1-hour token expiration**
- Role-based access control (Guest, Host, Admin)
- Secure password hashing with bcryptjs
- Token persistence in localStorage

### 🏘️ Listing Management
- **Hosts** can create, edit, and delete listings
- Multi-image upload support (max **3 images per listing**)
- Drag-and-drop file upload interface
- Atomic upload (images upload with listing creation)
- Category support (beach, mountain, city, villa, apartment, cabin, boutique, other)
- Availability status management (Live/Hidden)

### 📸 Image Storage
- **Google Cloud Storage (GCS)** integration for scalable image hosting
- Automatic fallback to local storage for development/permission issues
- Public URLs and signed URL generation
- Image optimization and validation

### 🔍 Search & Discovery
- Browse all available listings
- Search and filter functionality (keyword + category)
- Dedicated listing details page with full information, host profile, and image gallery
- Protected guest booking flow

### 👤 User Roles
- **Guest**: Browse listings, make bookings
- **Host**: Create and manage multiple listings
- **Admin**: Full platform management and oversight

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v22.4.1 or higher
- **npm** v10+ or **yarn**
- **MongoDB Atlas** account (free tier available)
- **Google Cloud Platform** account (for GCS, optional)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Deathbot545/StayHub.git
cd StayHub
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in the `backend/` directory:
```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stayhub?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URL=http://localhost:5173

# Google Cloud Storage (Optional)
GCP_PROJECT_ID=your-gcp-project-id
GCS_BUCKET=your-gcs-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=./stayhub-489907-0e76df346af1.json
```

Start the backend:
```bash
npm run dev
```
Backend runs on **http://localhost:5001**

#### 3. Frontend Setup
```bash
cd frontend/stayhub-frontend
npm install
```

Start the development server:
```bash
npm run dev
```
Frontend runs on **http://localhost:5173**

#### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📁 Project Structure

```
StayHub/
├── backend/                          # Node.js + Express API
│   ├── middleware/
│   │   └── auth.js                  # JWT verification & authorization
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── auth.js                  # Sign up, login, logout
│   │   ├── listings.js              # CRUD for listings with image upload
│   │   ├── bookings.js              # Booking management
│   │   ├── admin.js                 # Admin operations
│   │   └── uploads.js               # Batch image upload
│   ├── services/
│   │   └── gcs.js                   # Google Cloud Storage wrapper
│   ├── server.js                    # Express app & initialization
│   ├── seed.js                      # Database seeding script
│   └── package.json
│
├── frontend/
│   └── stayhub-frontend/            # React + Vite
│       ├── src/
│       │   ├── components/          # Reusable components
│       │   │   ├── Navbar.jsx
│       │   │   ├── SearchBar.jsx
│       │   │   ├── Results.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   ├── pages/               # Page components
│       │   │   ├── Home.jsx
│       │   │   ├── Listings.jsx
│       │   │   ├── MyListings.jsx   # Host dashboard
│       │   │   ├── SignUp.jsx
│       │   │   └── SignIn.jsx
│       │   ├── lib/
│       │   │   ├── api.js           # API fetch wrapper
│       │   │   └── AuthContext.jsx  # Global auth state
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── vite.config.js           # Vite config with API proxy
│       └── package.json
│
└── README.md                        # This file
```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout (frontend-only)

### Listings
- `GET /api/listings` - Get all public listings
- `GET /api/listings/:id` - Get one public listing with host details
- `GET /api/listings/mine` - Get user's listings (Host/Admin only)
- `POST /api/listings` - Create new listing with images (Host/Admin only)
- `PATCH /api/listings/:id` - Update listing (Host/Admin only)
- `DELETE /api/listings/:id` - Delete listing (Host/Admin only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user's bookings
- `PUT /api/bookings/:id` - Update booking status

### Admin
- `GET /api/admin/users` - List all users (Admin only)
- `GET /api/admin/bookings` - View all bookings (Admin only)

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 22.4.1
- **Framework**: Express 5.x
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Cloud Storage**: Google Cloud Storage SDK
- **CORS**: cors middleware

### Frontend
- **Library**: React 19.2.0
- **Build Tool**: Vite
- **Routing**: React Router 7.13.1
- **HTTP Client**: Fetch API
- **State Management**: React Context API (AuthContext)
- **Styling**: CSS (BEM methodology)

### DevOps & Tools
- **Package Manager**: npm
- **Development Server**: Vite dev server with hot reload
- **Backend Hot Reload**: nodemon
- **Version Control**: Git + GitHub

---

## 🔐 Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5001` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/stayhub` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key-min-32-chars` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `GCP_PROJECT_ID` | Google Cloud Project ID | `stayhub-489907` |
| `GCS_BUCKET` | GCS bucket name | `stayhub_bucket` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCS service account key | `./stayhub-489907-0e76df346af1.json` |

---

## 📦 Dependencies & Scripts

### Backend
```bash
npm run dev      # Start dev server with nodemon
npm start        # Production start
npm test         # Run tests (if configured)
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🚀 Deployment

### Backend (Production)
1. Set environment variables on hosting platform (Heroku, Railway, Render, etc.)
2. Ensure MongoDB Atlas allows connections from production IP
3. Configure GCS service account for production environment
4. Deploy with `npm start`

### Frontend (Production)
```bash
npm run build    # Creates optimized dist/ folder
# Deploy dist/ to hosting (Vercel, Netlify, GitHub Pages, etc.)
```

---

## 🔒 Security Best Practices

✅ **Implemented**
- JWT tokens with 1-hour expiration
- Password hashing with bcryptjs
- Role-based access control via middleware
- CORS enabled for frontend origin only
- Credentials excluded from version control (.gitignore)
- API request authorization headers

⚠️ **Recommendations**
- Use HTTPS in production
- Implement refresh tokens for better UX
- Add rate limiting for auth endpoints
- Regular security audits of dependencies
- Secure GCS service account with minimal IAM permissions
- Rotate JWT_SECRET periodically

---

## 🐛 Troubleshooting

### Images not showing?
- Verify `/uploads-local` proxy is configured in `vite.config.js`
- Check backend `.env` has correct `GCS_BUCKET` name
- Ensure images are in `backend/uploads/listings/`

### MongoDB connection fails?
- Verify connection string in `.env`
- Whitelist your IP in MongoDB Atlas Network Access
- Check database name matches connection string

### GCS upload permissions error?
- Service account needs `storage.objects.create` IAM role
- If unavailable, app automatically falls back to local storage
- Check `GOOGLE_APPLICATION_CREDENTIALS` path is correct

### Frontend not connecting to backend?
- Ensure backend is running on port 5001
- Check Vite proxy config points to correct backend URL
- Verify CORS is enabled in backend (should hit all origins in dev)

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Support & Contact

For questions or issues, please:
- Open an issue on [GitHub Issues](https://github.com/Deathbot545/StayHub/issues)
- Check existing documentation in backend/ and frontend/ READMEs
- Review code comments for implementation details

---

## 🎯 Future Enhancements

- [ ] Admin dashboard with analytics
- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications for bookings
- [ ] Reviews and ratings system
- [ ] Wishlist functionality
- [ ] Real-time messaging between guests and hosts
- [ ] Calendar availability picker
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

**Made with ❤️ for travelers exploring Sri Lanka**

*Last Updated: March 11, 2026*
