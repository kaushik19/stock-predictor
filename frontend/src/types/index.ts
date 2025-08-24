// Type definitions for the Stock Predictor application

export interface User {
  _id: string;
  email: string;
  profile: {
    name: string;
    investmentExperience: 'beginner' | 'intermediate' | 'expert';
    riskTolerance: 'low' | 'medium' | 'high';
    preferredTimeHorizon: ('daily' | 'weekly' | 'monthly' | 'yearly')[];
  };
  preferences: {
    sectors: string[];
    maxInvestmentAmount: number;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  isActive: boolean;
  isVerified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

export interface StockRecommendation {
  symbol: string;
  timeHorizon: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  entryPoint: number;
  scores: {
    technical: number;
    fundamental: number;
    sentiment: number;
  };
  reasons: string[];
  risks: string[];
  qualityScore?: number;
  qualityGrade?: 'Excellent' | 'Good' | 'Average' | 'Poor';
  evaluation?: 'Severely Overvalued' | 'Overvalued' | 'Fairly Valued' | 'Undervalued';
  financialTrend?: 'Improving' | 'Stable' | 'Declining';
  sectorRanking?: string;
}

export interface StockQuality {
  symbol: string;
  sector: string;
  qualityScore: number;
  qualityGrade: 'Excellent' | 'Good' | 'Average' | 'Poor';
  evaluation: {
    evaluation: 'Severely Overvalued' | 'Overvalued' | 'Fairly Valued' | 'Undervalued';
    confidence: 'High' | 'Medium' | 'Low';
    valuationRatio: number;
  };
  financialTrends: {
    revenue: TrendAnalysis;
    profit: TrendAnalysis;
    roe: TrendAnalysis;
    overall: 'Improving' | 'Stable' | 'Declining';
  };
  sectorComparison: {
    sector: string;
    overallRanking: 'Top Tier' | 'Above Average' | 'Average' | 'Below Average' | 'Bottom Tier';
    overallPercentile: number;
  };
  qualityDimensions: {
    growth: number;
    value: number;
    quality: number;
    momentum: number;
    stability: number;
  };
}

export interface TrendAnalysis {
  direction: 'Improving' | 'Stable' | 'Declining' | 'Unknown';
  strength: 'High' | 'Medium' | 'Low';
  metricName: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  holdings: PortfolioHolding[];
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  stocks: WatchlistStock[];
}

export interface WatchlistStock {
  symbol: string;
  addedAt: string;
  alerts?: PriceAlert[];
}

export interface PriceAlert {
  id: string;
  type: 'above' | 'below';
  price: number;
  isActive: boolean;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
  };
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  bollingerBands: {
    upperBand: number;
    middleBand: number;
    lowerBand: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}