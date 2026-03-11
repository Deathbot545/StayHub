# 🔧 StayHub Backend API

**Express.js REST API** for the StayHub vacation rental platform. Handles user authentication, listing management, bookings, and image uploads with Google Cloud Storage integration.

[![Node.js](https://img.shields.io/badge/Node.js-22.4.1-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![JWT](https://img.shields.io/badge/JWT-Auth-blue)](https://jwt.io/)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v22.4.1+
- npm v10+
- MongoDB Atlas account
- Google Cloud Platform account (optional)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env  # Or create manually (see below)

# Start development server (with hot reload)
npm run dev

# Start production server
npm start
```

### Environment Variables (.env)

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stayhub?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-must-be-at-least-32-characters-long
JWT_EXPIRATION=1h

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173

# Google Cloud Storage (Optional)
GCP_PROJECT_ID=stayhub-489907
GCS_BUCKET=stayhub_bucket
GOOGLE_APPLICATION_CREDENTIALS=./stayhub-489907-0e76df346af1.json
```

⚠️ **NEVER commit `.env` or GCS credentials to Git!**

---

## 📊 Database Models

### User
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: String (enum: ["guest", "host", "admin"], default: "guest"),
  phone: String,
  profilePhoto: String (URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Listing
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  location: String (required),
  category: String (enum: ["beach", "mountain", "city", "villa", "apartment", "cabin", "boutique", "other"], default: "other"),
  pricePerNight: Number (required, positive),
  amenities: [String],
  images: [String] (URLs, max 3),
  host: ObjectId (reference to User),
  available: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking
```javascript
{
  _id: ObjectId,
  guest: ObjectId (reference to User),
  listing: ObjectId (reference to Listing),
  checkIn: Date (required),
  checkOut: Date (required),
  totalPrice: Number (calculated),
  status: String (enum: ["pending", "confirmed", "cancelled"], default: "pending"),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication

### JWT Implementation
- **Token Expiration**: 1 hour
- **Storage**: localStorage (frontend responsibility)
- **Header Format**: `Authorization: Bearer <token>`
- **Payload**: `{ id, email, role, iat, exp }`

### Password Security
- Hashed with **bcryptjs** (10 salt rounds)
- Never stored in plain text
- Compared securely on login

### Role-Based Access Control
```
Guest:  Browse listings, make bookings
Host:   Create/edit/delete own listings
Admin:  Full platform access
```

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "guest|host"
}

Response: 201 Created
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "_id", "name", "email", "role" }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "_id", "name", "email", "role" }
}
```

---

### Listings Routes (`/api/listings`)

#### Get All Public Listings
```http
GET /api/listings

Response: 200 OK
[
  {
    "_id": "...",
    "title": "Beautiful Beach House",
    "location": "Mirissa",
    "pricePerNight": 4500,
    "images": ["url1", "url2"],
    "host": { "name": "Host Name", "email": "..." },
    "available": true
  }
]
```

#### Get Single Listing Details
```http
GET /api/listings/:id

Response: 200 OK
{
  "_id": "...",
  "title": "...",
  "description": "...",
  "location": "...",
  "category": "beach",
  "images": ["url1", "url2"],
  "host": { "name": "Host Name", "email": "...", "role": "host" }
}
```

#### Get Host's Listings
```http
GET /api/listings/mine
Authorization: Bearer <token>

Response: 200 OK
[listing1, listing2, ...]
```

#### Create Listing (with Images)
```http
POST /api/listings
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- title: "Cozy Mountain Cottage"
- location: "Nuwara Eliya"
- description: "Beautiful cottage in the mountains"
- pricePerNight: 3500
- amenities: "WiFi,Pool,Kitchen,AC"
- available: true
- images: [file1, file2, file3] (max 3 files)

Response: 201 Created
{
  "_id": "...",
  "title": "Cozy Mountain Cottage",
  "images": ["url1", "url2", "url3"],
  ... (full listing object)
}
```

#### Update Listing
```http
PATCH /api/listings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "available": false,
  ... (any fields)
}

Response: 200 OK
```

#### Delete Listing
```http
DELETE /api/listings/:id
Authorization: Bearer <token>

Response: 200 OK
{ "message": "Listing deleted" }
```

---

### Bookings Routes (`/api/bookings`)

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "listing": "listing_id",
  "checkIn": "2026-03-20",
  "checkOut": "2026-03-25"
}

Response: 201 Created
```

#### Get User's Bookings
```http
GET /api/bookings
Authorization: Bearer <token>

Response: 200 OK
[booking1, booking2, ...]
```

---

### Admin Routes (`/api/admin`)

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <token> (admin only)

Response: 200 OK
[user1, user2, ...]
```

#### Get All Bookings
```http
GET /api/admin/bookings
Authorization: Bearer <token> (admin only)

Response: 200 OK
[booking1, booking2, ...]
```

---

## 📸 Image Upload

### Storage Options

#### 1. Google Cloud Storage (Recommended)
- **Pros**: Scalable, production-ready, automatic signed URLs
- **Setup**: Set GCS environment variables, service account with credentials
- **Behavior**: Uploads are GCS-only; requests fail clearly when GCS is unavailable

#### 2. Local Storage (Development)
- Local storage is not used for new listing image uploads.
- Existing legacy files may still exist under `backend/uploads/listings/`.

### Upload Flow
```
1. Client sends multipart form with image files
2. Multer parses files (max 5MB each, 3 files per listing)
3. Backend tries to upload to GCS
4. If GCS fails → save locally
5. Return image URLs in listing
6. Frontend displays images via proxy or direct URL
```

### File Limits
- **Max per request**: 3 images
- **File size**: 5MB per image
- **Formats**: JPEG, PNG, WebP, GIF
- **Naming**: `{timestamp}-{random}-{originalname}`

---

## 🛡️ Middleware

### Authentication Middleware (`middleware/auth.js`)
```javascript
authenticateToken(req, res, next)
// Verifies JWT, attaches user to req.user
// 401 if missing/invalid token

authorizeRoles(...roles)(req, res, next)
// Checks user.role matches allowed roles
// 403 if role mismatch
```

### Error Handling
- Global error catching with detailed logs
- 400: Bad request (validation)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 500: Server error

---

## 📁 Project Structure

```
backend/
├── middleware/
│   └── auth.js                    # JWT & role verification
├── models/
│   ├── User.js                    # User schema & methods
│   ├── Listing.js                 # Listing schema
│   └── Booking.js                 # Booking schema
├── routes/
│   ├── auth.js                    # /api/auth endpoints
│   ├── listings.js                # /api/listings endpoints
│   ├── bookings.js                # /api/bookings endpoints
│   ├── admin.js                   # /api/admin endpoints
│   └── uploads.js                 # /api/uploads endpoints (batch)
├── services/
│   └── gcs.js                     # Google Cloud Storage wrapper
├── uploads/
│   └── listings/                  # Local image storage
├── server.js                      # Express app initialization
├── seed.js                        # Database seeding (optional)
├── .env                           # Environment variables (NEVER commit!)
├── .env.example                   # Example .env template
├── package.json
├── package-lock.json
└── README.md                      # This file
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server with auto-reload (nodemon)
npm run dev

# Start production server
npm start

# Seed database with sample data
node seed.js

# Check syntax
npm test
```

### Debugging

**Enable detailed logging:**
```javascript
// In routes - console.log with [route:action] prefix
console.log(`[listings:create] userId=${req.user.id} role=${req.user.role}`);
```

**Check backend logs for image uploads:**
```
[listings:create] userId=... role=host files=3
[listings:create] uploaded 3 image(s): {"gcs":3}
[listings:create] success listingId=...
```

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production` in environment
- [ ] Configure `MONGO_URI` to production database
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Configure `CLIENT_URL` to production frontend
- [ ] Set GCS credentials with proper IAM permissions
- [ ] Enable HTTPS on production domain
- [ ] Set up MongoDB backups
- [ ] Configure rate limiting for API endpoints
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable CORS for production frontend only
- [ ] Test all endpoints with production database

---

## 🐛 Common Issues & Solutions

### "MongoDB connection failed"
- Verify `MONGO_URI` in `.env`
- Whitelist your IP in MongoDB Atlas → Network Access
- Check network connectivity

### "GCS upload fails, falling back to local storage"
- Service account needs `storage.objects.create` permission
- This is normal in development — app will use local storage
- Check cloud console for IAM role assignments

### "401 Unauthorized on protected routes"
- Token might be expired (1-hour expiration)
- Verify token format: `Authorization: Bearer <token>`
- Clear localStorage and log in again

### "Images not showing in frontend"
- Verify vite.config.js has `/uploads-local` proxy
- Check backend static route is serving correctly
- Images should be in `backend/uploads/listings/` directory

---

## 📚 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.x | Web framework |
| mongoose | Latest | MongoDB ODM |
| jsonwebtoken | Latest | JWT authentication |
| bcryptjs | Latest | Password hashing |
| multer | Latest | File uploads |
| @google-cloud/storage | 7.x | GCS integration |
| dotenv | Latest | Environment variables |
| cors | Latest | CORS middleware |
| nodemon | Dev | Hot reload |

---

## 🔐 Security Notes

✅ **Best Practices**
- JWT tokens expire after 1 hour
- Passwords hashed with bcryptjs (10 rounds)
- Role-based access control on all sensitive endpoints
- MongoDB injection protection via Mongoose
- CORS restricted to frontend URL
- Credentials never committed to Git

⚠️ **To Improve**
- Implement refresh tokens for longer sessions
- Add rate limiting to auth endpoints
- Use HTTPS in production
- Implement request validation with joi/yup
- Add request logging middleware
- Regular security audits of dependencies

---

## 📞 Support

For backend-specific issues:
1. Check this README for common solutions
2. Review backend logs for error messages
3. Verify all `.env` variables are set correctly
4. Check MongoDB Atlas connection permissions
5. Open an issue on GitHub with error details

---

**Built with Node.js, Express, and MongoDB** 🚀

---

*Last Updated: March 11, 2026*
