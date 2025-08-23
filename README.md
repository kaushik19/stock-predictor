# Indian Stock Predictor

A comprehensive stock prediction application for the Indian market with real-time analysis, multi-timeframe recommendations, and intelligent portfolio management.

## 🚀 Current Status

**✅ PHASE 1 COMPLETE: Backend API Infrastructure**
- ✅ Project setup and development environment
- ✅ Express.js server with middleware (CORS, helmet, rate limiting)
- ✅ MongoDB & Redis database connections
- ✅ JWT-based authentication system
- ✅ Yahoo Finance API integration for real-time stock data
- ✅ Alpha Vantage API integration for fundamental analysis
- ✅ NewsAPI integration with sentiment analysis
- ✅ Comprehensive API documentation with Swagger
- ✅ Vue.js 3 frontend with Tailwind CSS

**🔄 NEXT PHASE: Recommendation Engine**
- 🔄 Technical analysis algorithms (RSI, MACD, Moving Averages)
- 🔄 Fundamental analysis engine
- 🔄 Multi-timeframe recommendation generation
- 🔄 Portfolio and watchlist features

## 🌟 Features

- 📊 **Real-time Stock Data** - Live prices, volume, and market data for Indian stocks (NSE/BSE)
- 📈 **Technical Analysis** - RSI, MACD, SMA, EMA, Bollinger Bands, Support/Resistance levels
- 📋 **Fundamental Analysis** - P/E ratios, financial statements, company overviews, health scores
- 📰 **News Sentiment Analysis** - AI-powered sentiment analysis of financial news
- 🔍 **Stock Search** - Intelligent search with autocomplete for Indian stocks
- 🎯 **Multi-timeframe Predictions** - Daily, weekly, monthly, and yearly recommendations (Coming Soon)
- 💼 **Portfolio Management** - Track investments with detailed P&L analysis (Coming Soon)
- 🌙 **Dark/Light Theme** - Beautiful UI with theme switching
- 📱 **Responsive Design** - Works seamlessly on all devices

## 🛠 Tech Stack

### Frontend
- **Vue.js 3** with Composition API
- **Tailwind CSS** for styling
- **Chart.js** for financial charts
- **Socket.io Client** for real-time updates
- **Vite** for fast development
- **Vue Router** for navigation
- **Pinia** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Redis** for caching and session storage
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Joi** for input validation
- **Winston** for logging
- **Swagger** for API documentation

### External APIs
- **Yahoo Finance API** - Primary stock data source
- **Alpha Vantage API** - Fundamental analysis data
- **NewsAPI** - Financial news and sentiment analysis

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Redis (local or cloud)
- API Keys (optional for demo mode):
  - Alpha Vantage API key
  - NewsAPI key

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd indian-stock-predictor
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Set up environment variables**
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration (MongoDB, Redis, API keys)

# Frontend environment (already configured)
cd ../frontend
# .env is already set up to connect to backend on localhost:5001
```

4. **Start the services**

**Option A: Start both services separately**
```bash
# Terminal 1: Start backend (runs on port 5001)
cd backend
npm start

# Terminal 2: Start frontend (runs on port 3000/3001)
cd frontend
npm run dev
```

**Option B: Use Docker (if available)**
```bash
docker-compose up -d
```

5. **Access the application**
- Frontend UI: http://localhost:3000 (or 3001 if 3000 is occupied)
- Backend API: http://localhost:5001/api
- API Documentation: http://localhost:5001/api-docs

## 📁 Project Structure

```
indian-stock-predictor/
├── backend/                    # Node.js API server
│   ├── config/                # Database and configuration
│   ├── middleware/            # Express middleware
│   ├── models/                # MongoDB models (User, Stock, etc.)
│   ├── routes/                # API routes
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── stocks.js         # Stock data endpoints
│   │   ├── fundamentals.js   # Fundamental analysis endpoints
│   │   ├── news.js           # News and sentiment endpoints
│   │   └── index.js          # Route aggregator
│   ├── services/              # Business logic services
│   │   ├── yahooFinanceService.js    # Yahoo Finance integration
│   │   ├── alphaVantageService.js    # Alpha Vantage integration
│   │   └── newsService.js            # News and sentiment analysis
│   ├── tests/                 # Unit and integration tests
│   ├── server.js             # Express server entry point
│   └── package.json          # Backend dependencies
├── frontend/                   # Vue.js application
│   ├── src/
│   │   ├── components/       # Reusable Vue components
│   │   ├── views/            # Page components
│   │   │   ├── Home.vue      # Landing page
│   │   │   ├── Dashboard.vue # Main dashboard
│   │   │   ├── Login.vue     # Authentication
│   │   │   └── ...           # Other pages
│   │   ├── router/           # Vue Router configuration
│   │   ├── stores/           # Pinia state management
│   │   └── main.js           # Vue app entry point
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
├── .kiro/                      # Kiro IDE specifications
│   └── specs/                 # Feature specifications and tasks
├── docker/                     # Docker configurations
└── README.md                  # This file
```

## 🔌 API Endpoints

### Core Endpoints
```
GET  /api/                     # API information
GET  /api/status               # Health check with system metrics
```

### Authentication
```
POST /api/auth/register        # User registration
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
GET  /api/auth/profile        # Get user profile
```

### Stock Data
```
GET  /api/stocks/quote/:symbol              # Real-time stock quote
POST /api/stocks/quotes                     # Multiple stock quotes
GET  /api/stocks/historical/:symbol         # Historical price data
GET  /api/stocks/technical/:symbol          # Technical indicators
GET  /api/stocks/search?q=query            # Search stocks
GET  /api/stocks/market-summary            # Market indices (Nifty, Sensex)
GET  /api/stocks/trending                  # Trending stocks
```

### Fundamental Analysis
```
GET  /api/fundamentals/overview/:symbol     # Company overview
GET  /api/fundamentals/income-statement/:symbol    # Income statement
GET  /api/fundamentals/balance-sheet/:symbol       # Balance sheet
GET  /api/fundamentals/cash-flow/:symbol           # Cash flow statement
GET  /api/fundamentals/comprehensive/:symbol       # All fundamental data
GET  /api/fundamentals/metrics/:symbol             # Derived financial metrics
GET  /api/fundamentals/health-score/:symbol        # Financial health score (0-100)
```

### News & Sentiment
```
GET  /api/news/financial                   # General financial news
GET  /api/news/search?q=query             # Search news articles
GET  /api/news/stock/:symbol              # Stock-specific news
POST /api/news/trending                   # Trending stocks by news volume
GET  /api/news/market-sentiment           # Overall market sentiment
POST /api/news/sentiment/analyze          # Custom sentiment analysis
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm run test
```

### Test Coverage
- Unit tests for all services and utilities
- Integration tests for API endpoints
- Mocked external API calls for reliable testing

## 📊 Example API Usage

### Get Stock Quote
```bash
curl "http://localhost:5001/api/stocks/quote/RELIANCE?exchange=NSE"
```

### Get Technical Indicators
```bash
curl "http://localhost:5001/api/stocks/technical/TCS?exchange=NSE"
```

### Get Company Fundamentals
```bash
curl "http://localhost:5001/api/fundamentals/overview/HDFCBANK?exchange=NSE"
```

### Search News
```bash
curl "http://localhost:5001/api/news/search?q=stock%20market&days=7"
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
# Server
NODE_ENV=development
PORT=5001
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/stock_predictor
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# External APIs (optional - demo keys work for testing)
ALPHA_VANTAGE_API_KEY=demo
NEWS_API_KEY=demo

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables (.env)
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
VITE_APP_NAME=Indian Stock Predictor
VITE_APP_VERSION=1.0.0
```

## 🎯 Development Workflow

This project follows a **spec-driven development** approach using Kiro IDE:

1. **Requirements Phase** - Detailed user stories and acceptance criteria
2. **Design Phase** - Architecture and technical specifications  
3. **Implementation Phase** - Task-based development with clear objectives

### Current Implementation Status
- ✅ **Task 1**: Project setup and development environment
- ✅ **Task 2**: Core backend API infrastructure  
- ✅ **Task 3**: Data aggregation and external API integration
- 🔄 **Task 4**: Recommendation engine core logic (In Progress)
- ⏳ **Task 5**: Vue.js frontend foundation
- ⏳ **Task 6**: Main dashboard with attractive UI
- ⏳ **Task 7**: Detailed stock analysis pages
- ⏳ **Task 8**: Portfolio and watchlist features

See `.kiro/specs/indian-stock-predictor/` for complete specifications and task details.

## 🚨 Known Issues

1. **Redis Authentication**: If you see Redis auth errors, either:
   - Set up Redis with no authentication for development
   - Configure Redis credentials in .env file

2. **API Rate Limits**: External APIs have rate limits:
   - Yahoo Finance: ~2000 requests/hour
   - Alpha Vantage: 5 requests/minute (free tier)
   - NewsAPI: 1000 requests/day (free tier)

3. **Port Conflicts**: If ports are occupied:
   - Backend: Change PORT in backend/.env
   - Frontend: Vite will auto-increment (3000 → 3001 → 3002...)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the existing code style and patterns
4. Add tests for new functionality
5. Update documentation as needed
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**Important**: This application provides stock predictions and analysis for **educational and informational purposes only**. 

- Past performance does not guarantee future results
- All investments carry risk of loss
- Always consult with a qualified financial advisor before making investment decisions
- The developers are not responsible for any financial losses incurred from using this application
- This is not financial advice

## 🙏 Acknowledgments

- Yahoo Finance for providing free stock data APIs
- Alpha Vantage for fundamental analysis data
- NewsAPI for financial news data
- The Vue.js and Node.js communities for excellent documentation and tools

---

**Happy Trading! 📈**

*Built with ❤️ for the Indian stock market community*