# Worthy Waste Backend

A complete Node.js + Express + MongoDB backend for Worthy Waste - A food waste management and marketplace platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and navigate to the backend directory**
   ```bash
   cd backendw
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/nutritrack-ai
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify installation**
   Visit `http://localhost:5000/health` to check if the server is running.

## 📁 Project Structure

```
backendw/
├── models/           # Mongoose schemas
│   ├── User.js
│   ├── FoodItem.js
│   ├── Donation.js
│   └── Transaction.js
├── routes/           # API route handlers
│   ├── auth.js
│   ├── inventory.js
│   ├── classify.js
│   ├── marketplace.js
│   └── analytics.js
├── utils/            # Utility functions
│   └── co2.js
├── uploads/          # File upload directory
├── server.js         # Main server file
├── package.json
├── .env.example
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Phone-based login (creates user if not exists)
- `GET /api/auth/user/:userId` - Get user profile

### Inventory Management
- `POST /api/inventory/add` - Add food item to inventory
- `GET /api/inventory/list/:userId` - List user's food items (sorted by expiry)
- `PUT /api/inventory/:id` - Update food item
- `DELETE /api/inventory/:id` - Delete food item

### Waste Classification
- `POST /api/classify/image` - Upload and classify waste image
- `GET /api/classify/categories` - Get available waste categories
- `DELETE /api/classify/image/:filename` - Delete uploaded image

### Marketplace
- `GET /api/marketplace/buyers` - Get list of buyers/composters
- `POST /api/marketplace/sell` - Create sale/donation transaction
- `GET /api/marketplace/transactions/:userId` - Get user's transactions
- `PUT /api/marketplace/transaction/:id/status` - Update transaction status

### Analytics
- `GET /api/analytics/summary/:userId` - Get user analytics summary
- `GET /api/analytics/leaderboard` - Get platform leaderboard
- `GET /api/analytics/global-stats` - Get global platform statistics

### System
- `GET /health` - Health check endpoint
- `GET /` - API information and available endpoints

## 📝 API Usage Examples

### 1. User Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "phone": "9876543210",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### 2. Add Food Item
```javascript
POST /api/inventory/add
Content-Type: application/json

{
  "userId": "64f8a1b2c3d4e5f6g7h8i9j0",
  "name": "Apples",
  "quantity": 2.5,
  "unit": "kg",
  "purchaseDate": "2024-01-15",
  "expiryDate": "2024-01-25",
  "storage": "refrigerator",
  "calories": 520,
  "category": "fruits"
}
```

### 3. Classify Waste Image
```javascript
POST /api/classify/image
Content-Type: multipart/form-data

FormData:
- image: [file]
- note: "Apple peels from kitchen"
```

### 4. Create Sale Transaction
```javascript
POST /api/marketplace/sell
Content-Type: application/json

{
  "userId": "64f8a1b2c3d4e5f6g7h8i9j0",
  "type": "sale",
  "amountKg": 5.0,
  "buyerName": "GreenEarth Composting Co.",
  "pricePerKg": 15,
  "wasteCategory": "compostable",
  "pickupAddress": "123 Main St, Mumbai",
  "scheduledDate": "2024-01-20T10:00:00Z"
}
```

### 5. Get Analytics Summary
```javascript
GET /api/analytics/summary/64f8a1b2c3d4e5f6g7h8i9j0

Response:
{
  "success": true,
  "summary": {
    "savedFoodCount": 25,
    "kgSold": 12.5,
    "totalEarned": 187.50,
    "greenCoinsEarned": 12,
    "foodInventory": {
      "total": 8,
      "expired": 1,
      "expiringSoon": 2,
      "fresh": 5
    },
    "environmentalImpact": {
      "co2Saved": 31.25,
      "treesEquivalent": 1.42,
      "wasteReduced": 12.5,
      "waterSaved": 12500
    }
  }
}
```

## 🗃️ Database Models

### User Model
```javascript
{
  phone: String (required, unique),
  name: String,
  email: String,
  greenCoins: Number (default: 0),
  totalKgSold: Number (default: 0),
  totalEarned: Number (default: 0),
  savedFoodCount: Number (default: 0),
  profilePicture: String,
  isActive: Boolean (default: true),
  timestamps: true
}
```

### FoodItem Model
```javascript
{
  userId: ObjectId (ref: User),
  name: String (required),
  quantity: Number (required),
  unit: String (default: 'kg'),
  purchaseDate: Date (required),
  expiryDate: Date (required),
  storage: String (enum: refrigerator, freezer, pantry, counter),
  calories: Number,
  category: String (enum: fruits, vegetables, dairy, meat, grains, beverages, other),
  status: String (enum: fresh, expiring_soon, expired, consumed, donated, sold),
  imageUrl: String,
  notes: String,
  timestamps: true
}
```

### Transaction Model
```javascript
{
  sellerId: ObjectId (ref: User),
  buyerName: String (required),
  buyerContact: String,
  type: String (enum: sale, donation),
  amountKg: Number (required),
  pricePerKg: Number,
  totalAmount: Number,
  wasteCategory: String (enum: compostable, recyclable, non-usable),
  status: String (enum: pending, confirmed, picked_up, completed, cancelled),
  paymentStatus: String (enum: pending, paid, failed),
  pickupAddress: String (required),
  scheduledDate: Date,
  completedDate: Date,
  greenCoinsEarned: Number,
  co2Saved: Number,
  notes: String,
  timestamps: true
}
```

## 🔧 Features

### ✅ Implemented Features
- **Phone-based Authentication** - Simple login with phone number
- **Food Inventory Management** - Track food items with expiry dates
- **Waste Classification** - Mock AI classifier for waste categorization
- **Marketplace Integration** - Connect with buyers and composters
- **Analytics Dashboard** - Comprehensive user and platform analytics
- **Environmental Impact Tracking** - CO2 savings and environmental metrics
- **File Upload Support** - Image upload with multer
- **Error Handling** - Comprehensive error handling and validation
- **CORS Support** - Cross-origin resource sharing enabled
- **Graceful Shutdown** - Proper cleanup on server shutdown

### 🎯 Key Capabilities
- **Real-time Expiry Tracking** - Automatic status updates for food items
- **Green Coins Gamification** - Reward system for sustainable actions
- **Mock Buyers Database** - Pre-populated list of waste buyers
- **Environmental Calculations** - CO2, water, and energy savings tracking
- **Comprehensive Analytics** - User stats, leaderboards, and insights
- **File Management** - Static file serving for uploaded images

## 🌱 Environmental Impact Features

The backend includes sophisticated environmental impact calculations:

- **CO2 Savings**: 2.5kg CO2 per kg of compostable waste diverted
- **Water Savings**: 1000L water per kg of food waste prevented
- **Tree Equivalency**: Based on 22kg CO2 absorption per tree per year
- **Energy Savings**: 3.5 kWh per kg of recyclable material
- **Landfill Reduction**: Space savings calculations

## 🔒 Security Features

- Input validation and sanitization
- File upload restrictions (images only, 5MB limit)
- CORS configuration for frontend integration
- Environment variable protection
- Error message sanitization in production

## 🚀 Deployment

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutritrack-ai
PORT=5000
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret
```

### Docker Support (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing the API

Use tools like Postman, Insomnia, or curl to test the endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Login user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","name":"Test User"}'

# Get buyers list
curl http://localhost:5000/api/marketplace/buyers
```

## 📊 Monitoring

The backend includes built-in logging and monitoring:
- Request logging middleware
- Error tracking and reporting
- Database connection monitoring
- Health check endpoint for uptime monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Ready for hackathon demo!** 🎉

The backend is fully functional and ready to be integrated with a React frontend. All major features are implemented with proper error handling, validation, and documentation.
