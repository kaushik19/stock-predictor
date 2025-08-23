# Indian Stock Predictor

A comprehensive stock prediction application for the Indian market with real-time analysis, multi-timeframe recommendations, and intelligent portfolio management.

## Features

- 📊 **Real-time Analysis** - Live market data with instant price updates
- 🎯 **Multi-timeframe Predictions** - Daily, weekly, monthly, and yearly recommendations
- 📰 **News Sentiment Analysis** - AI-powered news analysis and market sentiment
- 💼 **Portfolio Management** - Track investments with detailed P&L analysis
- 🌙 **Dark/Light Theme** - Beautiful UI with theme switching
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

### Frontend
- Vue.js 3 with Composition API
- Tailwind CSS for styling
- Chart.js for financial charts
- Socket.io for real-time updates
- Vite for fast development

### Backend
- Node.js with Express.js
- MongoDB for data storage
- Redis for caching
- Socket.io for real-time communication
- JWT authentication

### APIs
- Yahoo Finance API (Primary data source)
- Alpha Vantage API (Fundamental data)
- NewsAPI (Financial news)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Redis

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd indian-stock-predictor
```

2. Install dependencies for all projects
```bash
npm run install:all
```

3. Set up environment variables
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

4. Start the development servers
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Individual Commands

```bash
# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
indian-stock-predictor/
├── backend/                 # Node.js API server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   └── server.js           # Entry point
├── frontend/               # Vue.js application
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── views/          # Page components
│   │   ├── router/         # Vue Router config
│   │   ├── stores/         # Pinia stores
│   │   └── main.js         # Entry point
│   └── public/             # Static assets
└── .kiro/                  # Kiro IDE specifications
    └── specs/              # Feature specifications
```

## Development Workflow

This project follows a spec-driven development approach:

1. **Requirements** - Detailed user stories and acceptance criteria
2. **Design** - Architecture and technical specifications
3. **Tasks** - Implementation plan with actionable items

See `.kiro/specs/indian-stock-predictor/` for complete specifications.

## API Documentation

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Stock Data
```
GET /api/stocks/:symbol
GET /api/stocks/search?q=query
```

### Recommendations
```
GET /api/recommendations/daily
GET /api/recommendations/weekly
GET /api/recommendations/monthly
GET /api/recommendations/yearly
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This application provides stock predictions for educational and informational purposes only. Past performance does not guarantee future results. Always consult with a financial advisor before making investment decisions.