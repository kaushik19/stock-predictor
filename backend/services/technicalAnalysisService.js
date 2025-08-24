const YahooFinanceService = require('./yahooFinanceService');
const { logger } = require('../middleware/errorHandler');

/**
 * Technical Analysis Service
 * Provides comprehensive technical analysis calculations and indicators
 */
class TechnicalAnalysisService {
  constructor() {
    this.indicators = {
      RSI: 'RSI',
      MACD: 'MACD',
      SMA: 'SMA',
      EMA: 'EMA',
      BOLLINGER_BANDS: 'BOLLINGER_BANDS',
      STOCHASTIC: 'STOCHASTIC',
      WILLIAMS_R: 'WILLIAMS_R',
      CCI: 'CCI',
      ADX: 'ADX',
      MOMENTUM: 'MOMENTUM'
    };
  }

  /**
   * Get comprehensive technical analysis for a stock
   * @param {string} symbol - Stock symbol
   * @param {string} period - Time period (1mo, 3mo, 6mo, 1y)
   * @param {string} exchange - Exchange (NSE/BSE)
   * @returns {Object} Complete technical analysis
   */
  async getComprehensiveTechnicalAnalysis(symbol, period = '3mo', exchange = 'NSE') {
    try {
      // Create Yahoo Finance service instance
      const yahooFinanceService = new YahooFinanceService();
      
      // Get historical data
      const historicalData = await yahooFinanceService.getHistoricalData(symbol, period, '1d');
      
      if (!historicalData.data || historicalData.data.length < 50) {
        throw new Error('Insufficient historical data for technical analysis');
      }

      const prices = historicalData.data;
      const closePrices = prices.map(p => p.close).filter(p => p !== null);
      const highPrices = prices.map(p => p.high).filter(p => p !== null);
      const lowPrices = prices.map(p => p.low).filter(p => p !== null);
      const volumes = prices.map(p => p.volume).filter(p => p !== null);

      // Calculate all technical indicators
      const analysis = {
        symbol,
        period,
        lastUpdated: new Date(),
        indicators: {
          rsi: this.calculateRSI(closePrices),
          macd: this.calculateMACD(closePrices),
          movingAverages: {
            sma20: this.calculateSMA(closePrices, 20),
            sma50: this.calculateSMA(closePrices, 50),
            sma200: this.calculateSMA(closePrices, 200),
            ema12: this.calculateEMA(closePrices, 12),
            ema26: this.calculateEMA(closePrices, 26)
          },
          bollingerBands: this.calculateBollingerBands(closePrices),
          supportResistance: this.calculateSupportResistanceLevels(highPrices, lowPrices, closePrices),
          volumeAnalysis: this.calculateVolumeAnalysis(volumes, closePrices),
          momentum: this.calculateMomentumIndicators(closePrices, highPrices, lowPrices)
        },
        signals: this.generateTradingSignals(closePrices, highPrices, lowPrices, volumes)
      };

      return analysis;
    } catch (error) {
      logger.error('Error in comprehensive technical analysis:', error);
      throw error;
    }
  }

  /**
   * Calculate RSI (Relative Strength Index)
   * @param {Array} prices - Array of closing prices
   * @param {number} period - RSI period (default 14)
   * @returns {Object} RSI data
   */
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) {
      return { current: null, values: [], signal: 'insufficient_data' };
    }

    const gains = [];
    const losses = [];
    
    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const rsiValues = [];
    
    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
    
    // Calculate first RSI
    let rs = avgGain / (avgLoss || 0.0001);
    let rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);

    // Calculate subsequent RSI values using smoothed averages
    for (let i = period; i < gains.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
      rs = avgGain / (avgLoss || 0.0001);
      rsi = 100 - (100 / (1 + rs));
      rsiValues.push(rsi);
    }

    const currentRSI = rsiValues[rsiValues.length - 1];
    let signal = 'neutral';
    
    if (currentRSI > 70) signal = 'overbought';
    else if (currentRSI < 30) signal = 'oversold';
    else if (currentRSI > 50) signal = 'bullish';
    else signal = 'bearish';

    return {
      current: Math.round(currentRSI * 100) / 100,
      values: rsiValues.map(val => Math.round(val * 100) / 100),
      signal,
      period
    };
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * @param {Array} prices - Array of closing prices
   * @param {number} fastPeriod - Fast EMA period (default 12)
   * @param {number} slowPeriod - Slow EMA period (default 26)
   * @param {number} signalPeriod - Signal line EMA period (default 9)
   * @returns {Object} MACD data
   */
  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod + signalPeriod) {
      return { macdLine: null, signalLine: null, histogram: null, signal: 'insufficient_data' };
    }

    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    // Check if EMA calculations were successful
    if (!fastEMA.values || !slowEMA.values || fastEMA.values.length === 0 || slowEMA.values.length === 0) {
      return { macdLine: null, signalLine: null, histogram: null, signal: 'insufficient_data' };
    }
    
    // Calculate MACD line - align the arrays properly
    const macdLine = [];
    const minLength = Math.min(fastEMA.values.length, slowEMA.values.length);
    
    for (let i = 0; i < minLength; i++) {
      if (fastEMA.values[i] !== null && slowEMA.values[i] !== null) {
        macdLine.push(fastEMA.values[i] - slowEMA.values[i]);
      }
    }

    if (macdLine.length < signalPeriod) {
      return { macdLine: null, signalLine: null, histogram: null, signal: 'insufficient_data' };
    }

    // Calculate signal line (EMA of MACD line)
    const signalEMA = this.calculateEMA(macdLine, signalPeriod);
    
    if (!signalEMA.values || signalEMA.values.length === 0) {
      return { macdLine: null, signalLine: null, histogram: null, signal: 'insufficient_data' };
    }
    
    // Calculate histogram
    const histogram = [];
    const histogramStartIndex = signalPeriod - 1;
    
    for (let i = 0; i < signalEMA.values.length; i++) {
      const macdIndex = histogramStartIndex + i;
      if (macdIndex < macdLine.length && signalEMA.values[i] !== null) {
        histogram.push(macdLine[macdIndex] - signalEMA.values[i]);
      }
    }

    const currentMACD = macdLine.length > 0 ? macdLine[macdLine.length - 1] : null;
    const currentSignal = signalEMA.values.length > 0 ? signalEMA.values[signalEMA.values.length - 1] : null;
    const currentHistogram = histogram.length > 0 ? histogram[histogram.length - 1] : null;
    
    let signal = 'neutral';
    if (currentMACD !== null && currentSignal !== null && currentHistogram !== null) {
      if (currentMACD > currentSignal && currentHistogram > 0) signal = 'bullish';
      else if (currentMACD < currentSignal && currentHistogram < 0) signal = 'bearish';
    }

    return {
      macdLine: currentMACD !== null && currentMACD !== undefined ? Math.round(currentMACD * 10000) / 10000 : null,
      signalLine: currentSignal !== null && currentSignal !== undefined ? Math.round(currentSignal * 10000) / 10000 : null,
      histogram: currentHistogram !== null && currentHistogram !== undefined ? Math.round(currentHistogram * 10000) / 10000 : null,
      signal,
      values: {
        macd: macdLine.map(val => val !== null && val !== undefined ? Math.round(val * 10000) / 10000 : null),
        signal: signalEMA.values.map(val => val !== null && val !== undefined ? Math.round(val * 10000) / 10000 : null),
        histogram: histogram.map(val => val !== null && val !== undefined ? Math.round(val * 10000) / 10000 : null)
      }
    };
  }

  /**
   * Calculate Simple Moving Average (SMA)
   * @param {Array} prices - Array of prices
   * @param {number} period - Moving average period
   * @returns {Object} SMA data
   */
  calculateSMA(prices, period) {
    if (prices.length < period) {
      return { current: null, values: [], signal: 'insufficient_data' };
    }

    const smaValues = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((acc, price) => acc + price, 0);
      smaValues.push(sum / period);
    }

    const currentSMA = smaValues[smaValues.length - 1];
    const currentPrice = prices[prices.length - 1];
    
    let signal = 'neutral';
    if (currentPrice > currentSMA) signal = 'bullish';
    else if (currentPrice < currentSMA) signal = 'bearish';

    return {
      current: Math.round(currentSMA * 100) / 100,
      values: smaValues.map(val => Math.round(val * 100) / 100),
      signal,
      period
    };
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   * @param {Array} prices - Array of prices
   * @param {number} period - EMA period
   * @returns {Object} EMA data
   */
  calculateEMA(prices, period) {
    if (prices.length < period) {
      return { current: null, values: [], signal: 'insufficient_data' };
    }

    const multiplier = 2 / (period + 1);
    const emaValues = [];
    
    // Start with SMA for first value
    const initialSMA = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
    emaValues.push(initialSMA);
    
    // Calculate EMA for remaining values
    for (let i = period; i < prices.length; i++) {
      const ema = (prices[i] * multiplier) + (emaValues[emaValues.length - 1] * (1 - multiplier));
      emaValues.push(ema);
    }

    const currentEMA = emaValues[emaValues.length - 1];
    const currentPrice = prices[prices.length - 1];
    
    let signal = 'neutral';
    if (currentPrice > currentEMA) signal = 'bullish';
    else if (currentPrice < currentEMA) signal = 'bearish';

    return {
      current: Math.round(currentEMA * 100) / 100,
      values: emaValues.map(val => Math.round(val * 100) / 100),
      signal,
      period
    };
  }

  /**
   * Calculate Bollinger Bands
   * @param {Array} prices - Array of closing prices
   * @param {number} period - Period for calculation (default 20)
   * @param {number} stdDev - Standard deviation multiplier (default 2)
   * @returns {Object} Bollinger Bands data
   */
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) {
      return { upperBand: null, middleBand: null, lowerBand: null, signal: 'insufficient_data' };
    }

    const sma = this.calculateSMA(prices, period);
    const upperBand = [];
    const lowerBand = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = slice.reduce((sum, price) => sum + price, 0) / period;
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upperBand.push(mean + (stdDev * standardDeviation));
      lowerBand.push(mean - (stdDev * standardDeviation));
    }

    const currentPrice = prices[prices.length - 1];
    const currentUpper = upperBand[upperBand.length - 1];
    const currentLower = lowerBand[lowerBand.length - 1];
    const currentMiddle = sma.current;
    
    let signal = 'neutral';
    if (currentPrice >= currentUpper) signal = 'overbought';
    else if (currentPrice <= currentLower) signal = 'oversold';
    else if (currentPrice > currentMiddle) signal = 'bullish';
    else signal = 'bearish';

    return {
      upperBand: Math.round(currentUpper * 100) / 100,
      middleBand: Math.round(currentMiddle * 100) / 100,
      lowerBand: Math.round(currentLower * 100) / 100,
      signal,
      values: {
        upper: upperBand.map(val => Math.round(val * 100) / 100),
        middle: sma.values,
        lower: lowerBand.map(val => Math.round(val * 100) / 100)
      }
    };
  }  /**

   * Calculate Support and Resistance Levels
   * @param {Array} highs - Array of high prices
   * @param {Array} lows - Array of low prices
   * @param {Array} closes - Array of closing prices
   * @param {number} lookback - Lookback period for pivot detection (default 10)
   * @returns {Object} Support and resistance levels
   */
  calculateSupportResistanceLevels(highs, lows, closes, lookback = 10) {
    if (highs.length < lookback * 2 + 1) {
      return { support: [], resistance: [], signal: 'insufficient_data' };
    }

    const pivotHighs = [];
    const pivotLows = [];
    
    // Find pivot highs and lows
    for (let i = lookback; i < highs.length - lookback; i++) {
      let isHigh = true;
      let isLow = true;
      
      // Check if current point is a pivot high
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && highs[j] >= highs[i]) {
          isHigh = false;
          break;
        }
      }
      
      // Check if current point is a pivot low
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && lows[j] <= lows[i]) {
          isLow = false;
          break;
        }
      }
      
      if (isHigh) pivotHighs.push({ index: i, price: highs[i] });
      if (isLow) pivotLows.push({ index: i, price: lows[i] });
    }

    // Get recent support and resistance levels
    const recentPivotHighs = pivotHighs.slice(-5).map(p => p.price);
    const recentPivotLows = pivotLows.slice(-5).map(p => p.price);
    
    // Calculate key levels
    const resistance = recentPivotHighs.sort((a, b) => b - a);
    const support = recentPivotLows.sort((a, b) => a - b);
    
    const currentPrice = closes[closes.length - 1];
    let signal = 'neutral';
    
    if (resistance.length > 0 && currentPrice >= resistance[0] * 0.98) {
      signal = 'near_resistance';
    } else if (support.length > 0 && currentPrice <= support[0] * 1.02) {
      signal = 'near_support';
    }

    return {
      support: support.map(level => Math.round(level * 100) / 100),
      resistance: resistance.map(level => Math.round(level * 100) / 100),
      signal,
      pivotPoints: {
        highs: pivotHighs.slice(-10),
        lows: pivotLows.slice(-10)
      }
    };
  }

  /**
   * Calculate Volume Analysis
   * @param {Array} volumes - Array of volume data
   * @param {Array} prices - Array of closing prices
   * @param {number} period - Period for volume moving average (default 20)
   * @returns {Object} Volume analysis data
   */
  calculateVolumeAnalysis(volumes, prices, period = 20) {
    if (volumes.length < period || prices.length < period) {
      return { 
        averageVolume: null, 
        volumeRatio: null, 
        volumeTrend: null, 
        signal: 'insufficient_data' 
      };
    }

    // Calculate volume moving average
    const volumeMA = this.calculateSMA(volumes, period);
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / volumeMA.current;
    
    // Calculate On-Balance Volume (OBV)
    const obv = [];
    let obvValue = 0;
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) {
        obvValue += volumes[i];
      } else if (prices[i] < prices[i - 1]) {
        obvValue -= volumes[i];
      }
      obv.push(obvValue);
    }

    // Calculate Volume Price Trend (VPT)
    const vpt = [];
    let vptValue = 0;
    
    for (let i = 1; i < prices.length; i++) {
      const priceChange = (prices[i] - prices[i - 1]) / prices[i - 1];
      vptValue += volumes[i] * priceChange;
      vpt.push(vptValue);
    }

    // Determine volume trend
    const recentOBV = obv.slice(-5);
    const obvTrend = recentOBV[recentOBV.length - 1] > recentOBV[0] ? 'increasing' : 'decreasing';
    
    let signal = 'neutral';
    if (volumeRatio > 1.5 && obvTrend === 'increasing') signal = 'strong_bullish';
    else if (volumeRatio > 1.2 && obvTrend === 'increasing') signal = 'bullish';
    else if (volumeRatio > 1.5 && obvTrend === 'decreasing') signal = 'strong_bearish';
    else if (volumeRatio > 1.2 && obvTrend === 'decreasing') signal = 'bearish';

    return {
      averageVolume: Math.round(volumeMA.current),
      currentVolume: Math.round(currentVolume),
      volumeRatio: Math.round(volumeRatio * 100) / 100,
      volumeTrend: obvTrend,
      onBalanceVolume: Math.round(obv[obv.length - 1]),
      volumePriceTrend: Math.round(vpt[vpt.length - 1] * 100) / 100,
      signal
    };
  }

  /**
   * Calculate Momentum Indicators
   * @param {Array} closes - Array of closing prices
   * @param {Array} highs - Array of high prices
   * @param {Array} lows - Array of low prices
   * @returns {Object} Momentum indicators
   */
  calculateMomentumIndicators(closes, highs, lows) {
    const momentum = {};
    
    // Rate of Change (ROC)
    if (closes.length >= 12) {
      const roc = ((closes[closes.length - 1] - closes[closes.length - 12]) / closes[closes.length - 12]) * 100;
      momentum.rateOfChange = Math.round(roc * 100) / 100;
    }

    // Stochastic Oscillator
    if (closes.length >= 14 && highs.length >= 14 && lows.length >= 14) {
      const stochastic = this.calculateStochastic(closes, highs, lows);
      momentum.stochastic = stochastic;
    }

    // Williams %R
    if (closes.length >= 14 && highs.length >= 14 && lows.length >= 14) {
      const williamsR = this.calculateWilliamsR(closes, highs, lows);
      momentum.williamsR = williamsR;
    }

    // Commodity Channel Index (CCI)
    if (closes.length >= 20 && highs.length >= 20 && lows.length >= 20) {
      const cci = this.calculateCCI(closes, highs, lows);
      momentum.cci = cci;
    }

    return momentum;
  }

  /**
   * Calculate Stochastic Oscillator
   * @param {Array} closes - Array of closing prices
   * @param {Array} highs - Array of high prices
   * @param {Array} lows - Array of low prices
   * @param {number} kPeriod - %K period (default 14)
   * @param {number} dPeriod - %D period (default 3)
   * @returns {Object} Stochastic data
   */
  calculateStochastic(closes, highs, lows, kPeriod = 14, dPeriod = 3) {
    const kValues = [];
    
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
      const k = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(k);
    }

    // Calculate %D (SMA of %K)
    const dValues = [];
    for (let i = dPeriod - 1; i < kValues.length; i++) {
      const sum = kValues.slice(i - dPeriod + 1, i + 1).reduce((acc, val) => acc + val, 0);
      dValues.push(sum / dPeriod);
    }

    const currentK = kValues[kValues.length - 1];
    const currentD = dValues[dValues.length - 1];
    
    let signal = 'neutral';
    if (currentK > 80 && currentD > 80) signal = 'overbought';
    else if (currentK < 20 && currentD < 20) signal = 'oversold';
    else if (currentK > currentD) signal = 'bullish';
    else signal = 'bearish';

    return {
      k: Math.round(currentK * 100) / 100,
      d: Math.round(currentD * 100) / 100,
      signal
    };
  }

  /**
   * Calculate Williams %R
   * @param {Array} closes - Array of closing prices
   * @param {Array} highs - Array of high prices
   * @param {Array} lows - Array of low prices
   * @param {number} period - Period (default 14)
   * @returns {Object} Williams %R data
   */
  calculateWilliamsR(closes, highs, lows, period = 14) {
    const values = [];
    
    for (let i = period - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - period + 1, i + 1));
      const williamsR = ((highestHigh - closes[i]) / (highestHigh - lowestLow)) * -100;
      values.push(williamsR);
    }

    const current = values[values.length - 1];
    
    let signal = 'neutral';
    if (current <= -80) signal = 'oversold';
    else if (current >= -20) signal = 'overbought';
    else if (current > -50) signal = 'bullish';
    else signal = 'bearish';

    return {
      current: Math.round(current * 100) / 100,
      signal
    };
  }

  /**
   * Calculate Commodity Channel Index (CCI)
   * @param {Array} closes - Array of closing prices
   * @param {Array} highs - Array of high prices
   * @param {Array} lows - Array of low prices
   * @param {number} period - Period (default 20)
   * @returns {Object} CCI data
   */
  calculateCCI(closes, highs, lows, period = 20) {
    const typicalPrices = [];
    
    // Calculate typical prices
    for (let i = 0; i < closes.length; i++) {
      typicalPrices.push((highs[i] + lows[i] + closes[i]) / 3);
    }

    const cciValues = [];
    
    for (let i = period - 1; i < typicalPrices.length; i++) {
      const slice = typicalPrices.slice(i - period + 1, i + 1);
      const sma = slice.reduce((sum, price) => sum + price, 0) / period;
      const meanDeviation = slice.reduce((sum, price) => sum + Math.abs(price - sma), 0) / period;
      const cci = (typicalPrices[i] - sma) / (0.015 * meanDeviation);
      cciValues.push(cci);
    }

    const current = cciValues[cciValues.length - 1];
    
    let signal = 'neutral';
    if (current > 100) signal = 'overbought';
    else if (current < -100) signal = 'oversold';
    else if (current > 0) signal = 'bullish';
    else signal = 'bearish';

    return {
      current: Math.round(current * 100) / 100,
      signal
    };
  }

  /**
   * Generate Trading Signals based on all indicators
   * @param {Array} closes - Array of closing prices
   * @param {Array} highs - Array of high prices
   * @param {Array} lows - Array of low prices
   * @param {Array} volumes - Array of volume data
   * @returns {Object} Trading signals
   */
  generateTradingSignals(closes, highs, lows, volumes) {
    const signals = {
      overall: 'neutral',
      strength: 0,
      components: {
        trend: 'neutral',
        momentum: 'neutral',
        volume: 'neutral',
        volatility: 'neutral'
      },
      recommendation: 'hold'
    };

    try {
      // Get current indicators
      const rsi = this.calculateRSI(closes);
      const macd = this.calculateMACD(closes);
      const sma20 = this.calculateSMA(closes, 20);
      const sma50 = this.calculateSMA(closes, 50);
      const volumeAnalysis = this.calculateVolumeAnalysis(volumes, closes);
      const bollinger = this.calculateBollingerBands(closes);

      let bullishSignals = 0;
      let bearishSignals = 0;
      let totalSignals = 0;

      // RSI signals
      if (rsi.current !== null) {
        totalSignals++;
        if (rsi.signal === 'oversold') bullishSignals++;
        else if (rsi.signal === 'overbought') bearishSignals++;
        else if (rsi.signal === 'bullish') bullishSignals += 0.5;
        else if (rsi.signal === 'bearish') bearishSignals += 0.5;
      }

      // MACD signals
      if (macd.macdLine !== null) {
        totalSignals++;
        if (macd.signal === 'bullish') bullishSignals++;
        else if (macd.signal === 'bearish') bearishSignals++;
      }

      // Moving average signals
      if (sma20.current !== null && sma50.current !== null) {
        totalSignals++;
        if (sma20.current > sma50.current) bullishSignals++;
        else bearishSignals++;
      }

      // Volume signals
      if (volumeAnalysis.signal !== 'insufficient_data') {
        totalSignals++;
        if (volumeAnalysis.signal.includes('bullish')) bullishSignals++;
        else if (volumeAnalysis.signal.includes('bearish')) bearishSignals++;
      }

      // Bollinger Bands signals
      if (bollinger.signal !== 'insufficient_data') {
        totalSignals++;
        if (bollinger.signal === 'oversold') bullishSignals++;
        else if (bollinger.signal === 'overbought') bearishSignals++;
        else if (bollinger.signal === 'bullish') bullishSignals += 0.5;
        else if (bollinger.signal === 'bearish') bearishSignals += 0.5;
      }

      // Calculate overall signal
      if (totalSignals > 0) {
        const bullishRatio = bullishSignals / totalSignals;
        const bearishRatio = bearishSignals / totalSignals;
        
        signals.strength = Math.round(Math.abs(bullishRatio - bearishRatio) * 100);
        
        if (bullishRatio > 0.6) {
          signals.overall = 'bullish';
          signals.recommendation = 'buy';
        } else if (bearishRatio > 0.6) {
          signals.overall = 'bearish';
          signals.recommendation = 'sell';
        } else {
          signals.overall = 'neutral';
          signals.recommendation = 'hold';
        }
      }

      return signals;
    } catch (error) {
      logger.error('Error generating trading signals:', error);
      return signals;
    }
  }
}

module.exports = new TechnicalAnalysisService();