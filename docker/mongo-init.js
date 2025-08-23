// MongoDB initialization script for Docker
db = db.getSiblingDB('stock-predictor');

// Create application user
db.createUser({
  user: 'stockapp',
  pwd: 'stockapp123',
  roles: [
    {
      role: 'readWrite',
      db: 'stock-predictor'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.stocks.createIndex({ symbol: 1 }, { unique: true });
db.stocks.createIndex({ sector: 1 });
db.recommendations.createIndex({ symbol: 1, timeHorizon: 1 });
db.recommendations.createIndex({ validUntil: 1 });
db.portfolios.createIndex({ userId: 1 }, { unique: true });

print('MongoDB initialization completed for stock-predictor database');