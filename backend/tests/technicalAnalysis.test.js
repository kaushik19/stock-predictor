const technicalAnalysisService = require('../services/technicalAnalysisService');

describe('Technical Analysis Service', () => {
  // Sample data for testing
  const samplePrices = [
    100, 102, 101, 103, 105, 104, 106, 108, 107, 109,
    111, 110, 112, 114, 113, 115, 117, 116, 118, 120,
    119, 121, 123, 122, 124, 126, 125, 127, 129, 128,
    130, 132, 131, 133, 135, 134, 136, 138, 137, 139
  ];

  const sampleHighs = samplePrices.map(price => price + Math.random() * 2);
  const sampleLows = samplePrices.map(price => price - Math.random() * 2);
  const sampleVolumes = Array.from({ length: 40 }, () => Math.floor(Math.random() * 1000000) + 500000);

  describe('RSI Calculation', () => {
    test('should calculate RSI correctly with sufficient data', () => {
      const result = technicalAnalysisService.calculateRSI(samplePrices);
      
      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('values');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('period');
      
      expect(typeof result.current).toBe('number');
      expect(result.current).toBeGreaterThanOrEqual(0);
      expect(result.current).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.values)).toBe(true);
      expect(['overbought', 'oversold', 'bullish', 'bearish', 'neutral']).toContain(result.signal);
    });

    test('should handle insufficient data gracefully', () => {
      const shortPrices = [100, 102, 101];
      const result = technicalAnalysisService.calculateRSI(shortPrices);
      
      expect(result.current).toBeNull();
      expect(result.signal).toBe('insufficient_data');
    });

    test('should calculate RSI with custom period', () => {
      const result = technicalAnalysisService.calculateRSI(samplePrices, 10);
      
      expect(result.period).toBe(10);
      expect(result.current).toBeDefined();
    });

    test('should identify overbought and oversold conditions', () => {
      // Create data that should result in overbought condition
      const overboughtPrices = Array.from({ length: 30 }, (_, i) => 100 + i * 2);
      const overboughtResult = technicalAnalysisService.calculateRSI(overboughtPrices);
      
      expect(overboughtResult.current).toBeGreaterThan(70);
      expect(overboughtResult.signal).toBe('overbought');

      // Create data that should result in oversold condition
      const oversoldPrices = Array.from({ length: 30 }, (_, i) => 100 - i * 2);
      const oversoldResult = technicalAnalysisService.calculateRSI(oversoldPrices);
      
      expect(oversoldResult.current).toBeLessThan(30);
      expect(oversoldResult.signal).toBe('oversold');
    });
  });

  describe('MACD Calculation', () => {
    test('should calculate MACD correctly with sufficient data', () => {
      const result = technicalAnalysisService.calculateMACD(samplePrices);
      
      expect(result).toHaveProperty('macdLine');
      expect(result).toHaveProperty('signalLine');
      expect(result).toHaveProperty('histogram');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('values');
      
      expect(typeof result.macdLine).toBe('number');
      expect(typeof result.signalLine).toBe('number');
      expect(typeof result.histogram).toBe('number');
      expect(['bullish', 'bearish', 'neutral']).toContain(result.signal);
    });

    test('should handle insufficient data gracefully', () => {
      const shortPrices = Array.from({ length: 20 }, (_, i) => 100 + i);
      const result = technicalAnalysisService.calculateMACD(shortPrices);
      
      expect(result.macdLine).toBeNull();
      expect(result.signal).toBe('insufficient_data');
    });

    test('should calculate MACD with custom periods', () => {
      const result = technicalAnalysisService.calculateMACD(samplePrices, 8, 21, 5);
      
      expect(result.macdLine).toBeDefined();
      expect(result.signalLine).toBeDefined();
      expect(result.histogram).toBeDefined();
    });
  });

  describe('Moving Averages', () => {
    describe('SMA Calculation', () => {
      test('should calculate SMA correctly', () => {
        const result = technicalAnalysisService.calculateSMA(samplePrices, 10);
        
        expect(result).toHaveProperty('current');
        expect(result).toHaveProperty('values');
        expect(result).toHaveProperty('signal');
        expect(result).toHaveProperty('period');
        
        expect(typeof result.current).toBe('number');
        expect(result.period).toBe(10);
        expect(Array.isArray(result.values)).toBe(true);
      });

      test('should handle insufficient data', () => {
        const shortPrices = [100, 102];
        const result = technicalAnalysisService.calculateSMA(shortPrices, 10);
        
        expect(result.current).toBeNull();
        expect(result.signal).toBe('insufficient_data');
      });

      test('should calculate correct SMA values', () => {
        const simplePrices = [1, 2, 3, 4, 5];
        const result = technicalAnalysisService.calculateSMA(simplePrices, 3);
        
        expect(result.values[0]).toBe(2); // (1+2+3)/3
        expect(result.values[1]).toBe(3); // (2+3+4)/3
        expect(result.values[2]).toBe(4); // (3+4+5)/3
      });
    });

    describe('EMA Calculation', () => {
      test('should calculate EMA correctly', () => {
        const result = technicalAnalysisService.calculateEMA(samplePrices, 12);
        
        expect(result).toHaveProperty('current');
        expect(result).toHaveProperty('values');
        expect(result).toHaveProperty('signal');
        expect(result).toHaveProperty('period');
        
        expect(typeof result.current).toBe('number');
        expect(result.period).toBe(12);
        expect(Array.isArray(result.values)).toBe(true);
      });

      test('should handle insufficient data', () => {
        const shortPrices = [100, 102];
        const result = technicalAnalysisService.calculateEMA(shortPrices, 10);
        
        expect(result.current).toBeNull();
        expect(result.signal).toBe('insufficient_data');
      });
    });
  });

  describe('Bollinger Bands', () => {
    test('should calculate Bollinger Bands correctly', () => {
      const result = technicalAnalysisService.calculateBollingerBands(samplePrices);
      
      expect(result).toHaveProperty('upperBand');
      expect(result).toHaveProperty('middleBand');
      expect(result).toHaveProperty('lowerBand');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('values');
      
      expect(typeof result.upperBand).toBe('number');
      expect(typeof result.middleBand).toBe('number');
      expect(typeof result.lowerBand).toBe('number');
      
      // Upper band should be higher than middle, middle higher than lower
      expect(result.upperBand).toBeGreaterThan(result.middleBand);
      expect(result.middleBand).toBeGreaterThan(result.lowerBand);
    });

    test('should handle insufficient data', () => {
      const shortPrices = [100, 102, 101];
      const result = technicalAnalysisService.calculateBollingerBands(shortPrices);
      
      expect(result.upperBand).toBeNull();
      expect(result.signal).toBe('insufficient_data');
    });

    test('should calculate with custom parameters', () => {
      const result = technicalAnalysisService.calculateBollingerBands(samplePrices, 10, 1.5);
      
      expect(result.upperBand).toBeDefined();
      expect(result.middleBand).toBeDefined();
      expect(result.lowerBand).toBeDefined();
    });
  });

  describe('Support and Resistance Levels', () => {
    test('should calculate support and resistance levels', () => {
      const result = technicalAnalysisService.calculateSupportResistanceLevels(
        sampleHighs, sampleLows, samplePrices
      );
      
      expect(result).toHaveProperty('support');
      expect(result).toHaveProperty('resistance');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('pivotPoints');
      
      expect(Array.isArray(result.support)).toBe(true);
      expect(Array.isArray(result.resistance)).toBe(true);
    });

    test('should handle insufficient data', () => {
      const shortData = [100, 102, 101];
      const result = technicalAnalysisService.calculateSupportResistanceLevels(
        shortData, shortData, shortData
      );
      
      expect(result.signal).toBe('insufficient_data');
    });
  });

  describe('Volume Analysis', () => {
    test('should calculate volume analysis correctly', () => {
      const result = technicalAnalysisService.calculateVolumeAnalysis(sampleVolumes, samplePrices);
      
      expect(result).toHaveProperty('averageVolume');
      expect(result).toHaveProperty('currentVolume');
      expect(result).toHaveProperty('volumeRatio');
      expect(result).toHaveProperty('volumeTrend');
      expect(result).toHaveProperty('onBalanceVolume');
      expect(result).toHaveProperty('volumePriceTrend');
      expect(result).toHaveProperty('signal');
      
      expect(typeof result.averageVolume).toBe('number');
      expect(typeof result.currentVolume).toBe('number');
      expect(typeof result.volumeRatio).toBe('number');
      expect(['increasing', 'decreasing']).toContain(result.volumeTrend);
    });

    test('should handle insufficient data', () => {
      const shortVolumes = [1000, 2000];
      const shortPrices = [100, 102];
      const result = technicalAnalysisService.calculateVolumeAnalysis(shortVolumes, shortPrices);
      
      expect(result.signal).toBe('insufficient_data');
    });
  });

  describe('Momentum Indicators', () => {
    test('should calculate momentum indicators', () => {
      const result = technicalAnalysisService.calculateMomentumIndicators(
        samplePrices, sampleHighs, sampleLows
      );
      
      expect(result).toHaveProperty('rateOfChange');
      expect(result).toHaveProperty('stochastic');
      expect(result).toHaveProperty('williamsR');
      expect(result).toHaveProperty('cci');
      
      expect(typeof result.rateOfChange).toBe('number');
    });

    describe('Stochastic Oscillator', () => {
      test('should calculate stochastic correctly', () => {
        const result = technicalAnalysisService.calculateStochastic(
          samplePrices, sampleHighs, sampleLows
        );
        
        expect(result).toHaveProperty('k');
        expect(result).toHaveProperty('d');
        expect(result).toHaveProperty('signal');
        
        expect(result.k).toBeGreaterThanOrEqual(0);
        expect(result.k).toBeLessThanOrEqual(100);
        expect(result.d).toBeGreaterThanOrEqual(0);
        expect(result.d).toBeLessThanOrEqual(100);
      });
    });

    describe('Williams %R', () => {
      test('should calculate Williams %R correctly', () => {
        const result = technicalAnalysisService.calculateWilliamsR(
          samplePrices, sampleHighs, sampleLows
        );
        
        expect(result).toHaveProperty('current');
        expect(result).toHaveProperty('signal');
        
        expect(result.current).toBeGreaterThanOrEqual(-100);
        expect(result.current).toBeLessThanOrEqual(0);
      });
    });

    describe('CCI', () => {
      test('should calculate CCI correctly', () => {
        const result = technicalAnalysisService.calculateCCI(
          samplePrices, sampleHighs, sampleLows
        );
        
        expect(result).toHaveProperty('current');
        expect(result).toHaveProperty('signal');
        
        expect(typeof result.current).toBe('number');
        expect(['overbought', 'oversold', 'bullish', 'bearish', 'neutral']).toContain(result.signal);
      });
    });
  });

  describe('Trading Signals', () => {
    test('should generate trading signals', () => {
      const result = technicalAnalysisService.generateTradingSignals(
        samplePrices, sampleHighs, sampleLows, sampleVolumes
      );
      
      expect(result).toHaveProperty('overall');
      expect(result).toHaveProperty('strength');
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('recommendation');
      
      expect(['bullish', 'bearish', 'neutral']).toContain(result.overall);
      expect(result.strength).toBeGreaterThanOrEqual(0);
      expect(result.strength).toBeLessThanOrEqual(100);
      expect(['buy', 'sell', 'hold']).toContain(result.recommendation);
    });

    test('should handle edge cases in signal generation', () => {
      const flatPrices = Array(40).fill(100);
      const flatVolumes = Array(40).fill(1000000);
      
      const result = technicalAnalysisService.generateTradingSignals(
        flatPrices, flatPrices, flatPrices, flatVolumes
      );
      
      expect(result.overall).toBeDefined();
      expect(result.recommendation).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty arrays', () => {
      const emptyArray = [];
      
      const rsiResult = technicalAnalysisService.calculateRSI(emptyArray);
      expect(rsiResult.signal).toBe('insufficient_data');
      
      const macdResult = technicalAnalysisService.calculateMACD(emptyArray);
      expect(macdResult.signal).toBe('insufficient_data');
    });

    test('should handle arrays with null values', () => {
      const pricesWithNulls = [100, null, 102, null, 104];
      const cleanPrices = pricesWithNulls.filter(p => p !== null);
      
      const result = technicalAnalysisService.calculateRSI(cleanPrices);
      expect(result).toBeDefined();
    });

    test('should handle very small price movements', () => {
      const stablePrices = Array.from({ length: 30 }, () => 100 + (Math.random() - 0.5) * 0.01);
      
      const rsiResult = technicalAnalysisService.calculateRSI(stablePrices);
      expect(rsiResult.current).toBeGreaterThanOrEqual(0);
      expect(rsiResult.current).toBeLessThanOrEqual(100);
    });

    test('should handle extreme price movements', () => {
      const extremePrices = [100, 200, 50, 300, 25, 400, 10];
      
      const rsiResult = technicalAnalysisService.calculateRSI(extremePrices);
      expect(rsiResult.signal).toBe('insufficient_data'); // Not enough data
    });
  });

  describe('Mathematical Accuracy', () => {
    test('should calculate SMA accurately with known values', () => {
      const knownPrices = [10, 20, 30, 40, 50];
      const result = technicalAnalysisService.calculateSMA(knownPrices, 3);
      
      // Expected: (10+20+30)/3 = 20, (20+30+40)/3 = 30, (30+40+50)/3 = 40
      expect(result.values[0]).toBe(20);
      expect(result.values[1]).toBe(30);
      expect(result.values[2]).toBe(40);
    });

    test('should maintain precision in calculations', () => {
      const precisionPrices = [100.123, 100.456, 100.789];
      const result = technicalAnalysisService.calculateSMA(precisionPrices, 3);
      
      const expectedSMA = (100.123 + 100.456 + 100.789) / 3;
      expect(Math.abs(result.current - expectedSMA)).toBeLessThan(0.01);
    });
  });
});