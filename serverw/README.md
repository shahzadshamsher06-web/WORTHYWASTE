# NutriTrackAI Frontend

A modern React frontend for the NutriTrackAI food waste management platform. This application provides an intuitive interface for tracking food inventory, classifying waste, connecting with buyers in the marketplace, and analyzing environmental impact.

## 🚀 Features

- **Phone-based Authentication** - Simple login with phone number
- **Food Inventory Management** - Add, track, and manage food items with expiry dates
- **AI-Powered Waste Classification** - Upload images to classify waste and get disposal recommendations
- **Marketplace Integration** - Connect with buyers to sell or donate excess food
- **Analytics & Leaderboard** - Track your environmental impact and compete with other users
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Updates** - Live data synchronization with backend APIs

## 🛠️ Tech Stack

- **React** 18.2.0 - Modern UI library with hooks
- **Chart.js** 4.4.0 - Beautiful charts for analytics
- **Axios** 1.6.0 - HTTP client for API communication
- **CSS3** - Custom responsive styling with modern design patterns

## 📋 Prerequisites

Before running the frontend, ensure you have:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Backend server** running on `http://localhost:5000`

## 🔧 Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd worthywaste/serverw
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify backend connection**:
   - Ensure the backend server is running on `http://localhost:5000`
   - The API base URL is configured in `src/services/api.js`

## 🚀 Running the Application

### Development Mode
```bash
npm start
```
- Opens the app at `http://localhost:3000`
- Hot reload enabled for development
- Console logging for debugging

### Production Build
```bash
npm run build
```
- Creates optimized production build in `build/` folder
- Ready for deployment to any static hosting service

### Testing
```bash
npm test
```
- Runs the test suite in interactive watch mode

## 📱 Application Structure

```
src/
├── components/           # React components
│   ├── Login.js         # Phone authentication
│   ├── Navbar.js        # Navigation bar
│   ├── Dashboard.js     # Main dashboard
│   ├── AddFood.js       # Add food items
│   ├── ClassifyWaste.js # Waste classification
│   ├── Marketplace.js   # Buyer marketplace
│   └── Analytics.js     # Charts and leaderboard
├── services/
│   └── api.js          # API service layer
├── styles.css          # Global styles
├── App.js             # Main app component
└── index.js           # React entry point
```

## 🔌 API Integration

The frontend communicates with the backend through these endpoints:

### Authentication
- `POST /api/auth/login` - Phone-based login
- `GET /api/auth/user/:id` - Get user profile

### Inventory Management
- `POST /api/inventory/add` - Add food item
- `GET /api/inventory/list/:userId` - Get user's inventory
- `PUT /api/inventory/update/:id` - Update food item
- `DELETE /api/inventory/delete/:id` - Delete food item

### Waste Classification
- `POST /api/classify/upload` - Upload and classify waste image

### Marketplace
- `GET /api/marketplace/buyers` - Get available buyers
- `POST /api/marketplace/transaction` - Create sale/donation
- `GET /api/marketplace/transactions/:userId` - Get user transactions

### Analytics
- `GET /api/analytics/user/:userId` - Get user summary
- `GET /api/analytics/leaderboard` - Get leaderboard
- `GET /api/analytics/global` - Get global statistics

## 🎨 UI Components

### Login Component
- Phone number input with validation
- Optional name and email fields
- Loading states and error handling
- Automatic user creation if not exists

### Dashboard
- Inventory overview with expiry status
- Quick stats (food saved, earnings, CO₂ impact)
- Action buttons for quick navigation
- Tips and insights section

### Add Food Form
- Comprehensive form with validation
- Category and storage location selection
- Date pickers for purchase and expiry dates
- Quantity and unit selection
- Optional calories and notes

### Waste Classification
- Drag-and-drop image upload
- Real-time image preview
- Classification results with confidence
- Environmental impact display
- Disposal recommendations

### Marketplace
- Tabbed interface (Buyers, Inventory, Transactions)
- Buyer profiles with ratings and preferences
- Sell/donate modal with pricing
- Transaction history with status tracking

### Analytics Dashboard
- Personal impact statistics
- Interactive charts (Doughnut, Line)
- Leaderboard with rankings
- Achievement system with progress tracking
- Global platform statistics

## 🎯 User Flow

1. **Login** - Enter phone number to authenticate
2. **Dashboard** - View inventory and quick stats
3. **Add Food** - Track new food items with details
4. **Classify Waste** - Upload images for AI classification
5. **Marketplace** - Connect with buyers to sell/donate
6. **Analytics** - Monitor impact and compare with others

## 🔧 Configuration

### API Base URL
Update the base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### Environment Variables
Create `.env` file for environment-specific settings:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🎨 Styling

The application uses a modern, responsive design with:
- **CSS Grid** and **Flexbox** for layouts
- **Custom properties** for consistent theming
- **Mobile-first** responsive design
- **Loading states** and **error handling**
- **Smooth transitions** and **hover effects**

### Color Palette
- Primary: `#3b82f6` (Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)
- Gray scale: `#f9fafb` to `#111827`

## 🚀 Deployment

### Static Hosting (Netlify, Vercel)
1. Build the project: `npm run build`
2. Deploy the `build/` folder
3. Configure environment variables
4. Set up redirects for SPA routing

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

**Backend Connection Error**
- Verify backend server is running on port 5000
- Check CORS configuration in backend
- Ensure API endpoints are accessible

**Charts Not Rendering**
- Verify Chart.js dependencies are installed
- Check browser console for errors
- Ensure data format matches chart requirements

**Authentication Issues**
- Clear localStorage: `localStorage.clear()`
- Check phone number format validation
- Verify backend auth endpoints

**Mobile Responsiveness**
- Test on various screen sizes
- Check CSS media queries
- Verify touch interactions work properly

## 📝 Development Guidelines

### Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Add loading states for async operations
- Follow React best practices

### Performance
- Lazy load components when possible
- Optimize images and assets
- Implement proper caching strategies
- Monitor bundle size

### Testing
- Write unit tests for components
- Test API integration thoroughly
- Verify responsive design
- Test user flows end-to-end

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review backend API documentation
- Create an issue on GitHub
- Contact the development team

---

**Built with ❤️ for a sustainable future** 🌱
