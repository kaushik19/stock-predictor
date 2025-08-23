const axios = require('axios');
const { logger } = require('../middleware/errorHandler');
const { setCache, getFromCache } = require('../config/database');

/**
 * Alpha Vantage API Service
 * Provides fundamental data, financial ratios, and company information
 */
class AlphaVantageService {
  constructor() {
    this.baseURL = 'https://www.alphavantage.co/query';
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.cacheTimeout = 3600; // 1 hour cache for fundamental data
    this.rateLimitDelay = 12000; // 12 seconds between requests (5 calls per minute limit)
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.isProcessingQueue = false;

    if (!this.apiKey) {
      logger.warn('Alpha Vantage API key not found. Fundamental data features will be limited.');
    }
  }

  /**
   * Rate limiting with queue to respect API limits
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Add request to queue for processing
   * @param {Function} requestFunction - Function that makes the API request
   * @returns {Promise} Promise that resolves with the request result
   */
  async queueRequest(requestFunction) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFunction, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process the request queue with rate limiting
   */
  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const { requestFunction, resolve, reject } = this.requestQueue.shift();
      
      try {
        await this.rateLimit();
        const result = await requestFunction();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Convert Indian stock symbol to Alpha Vantage format
   * @param {string} symbol - Stock symbol (e.g., 'RELIANCE', 'TCS')
   * @param {string} exchange - Exchange ('NSE' or 'BSE')
   * @returns {string} Alpha Vantage symbol format
   */
  formatSymbol(symbol, exchange = 'NSE') {
    // Remove any existing suffixes
    const cleanSymbol = symbol.replace(/\.(NS|BO|NSE|BSE)$/, '');
    
    // Alpha Vantage uses different formats for Indian stocks
    // For NSE: SYMBOL.BSE (confusingly, they use .BSE for NSE stocks)
    // For BSE: SYMBOL.BO
    if (exchange === 'BSE') {
      return `${cleanSymbol}.BO`;
    }
    return `${cleanSymbol}.BSE`; // NSE stocks use .BSE suffix in Alpha Vantage
  }

  /**
   * Get company overview and fundamental data
   * @param {string} symbol - Stock symbol
   * @param {string} exchange - Exchange (NSE/BSE)
   * @returns {Object} Company overview data
   */
  async getCompanyOverview(symbol, exchange = 'NSE') {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const alphaSymbol = this.formatSymbol(symbol, exchange);
    const cacheKey = `alpha_overview_${alphaSymbol}`;
    
    // Check cache first (longer cache for fundamental data)
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for company overview: ${alphaSymbol}`);
      return cachedData;
    }

    const requestFunction = async () => {
      const params = {
        function: 'OVERVIEW',
        symbol: alphaSymbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { 
        params,
        timeout: 15000
      });

      if (response.data['Error Message']) {
        throw new Error(`Alpha Vantage API Error: ${response.data['Error Message']}`);
      }

      if (response.data['Note']) {
        throw new Error('Alpha Vantage API rate limit exceeded. Please try again later.');
      }

      if (!response.data.Symbol) {
        throw new Error(`No company data found for symbol: ${alphaSymbol}`);
      }

      return response.data;
    };

    try {
      const rawData = await this.queueRequest(requestFunction);
      const processedData = this.processCompanyOverview(rawData);
      
      // Cache for 4 hours (fundamental data doesn't change frequently)
      await setCache(cacheKey, processedData, 14400);
      
      logger.info(`Fetched company overview for ${alphaSymbol}`);
      return processedData;

    } catch (error) {
      logger.error(`Error fetching company overview for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch company overview for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Get income statement data
   * @param {string} symbol - Stock symbol
   * @param {string} exchange - Exchange (NSE/BSE)
   * @returns {Object} Income statement data
   */
  async getIncomeStatement(symbol, exchange = 'NSE') {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const alphaSymbol = this.formatSymbol(symbol, exchange);
    const cacheKey = `alpha_income_${alphaSymbol}`;
    
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for income statement: ${alphaSymbol}`);
      return cachedData;
    }

    const requestFunction = async () => {
      const params = {
        function: 'INCOME_STATEMENT',
        symbol: alphaSymbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { 
        params,
        timeout: 15000
      });

      if (response.data['Error Message']) {
        throw new Error(`Alpha Vantage API Error: ${response.data['Error Message']}`);
      }

      if (response.data['Note']) {
        throw new Error('Alpha Vantage API rate limit exceeded. Please try again later.');
      }

      return response.data;
    };

    try {
      const rawData = await this.queueRequest(requestFunction);
      const processedData = this.processIncomeStatement(rawData);
      
      // Cache for 24 hours
      await setCache(cacheKey, processedData, 86400);
      
      logger.info(`Fetched income statement for ${alphaSymbol}`);
      return processedData;

    } catch (error) {
      logger.error(`Error fetching income statement for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch income statement for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Get balance sheet data
   * @param {string} symbol - Stock symbol
   * @param {string} exchange - Exchange (NSE/BSE)
   * @returns {Object} Balance sheet data
   */
  async getBalanceSheet(symbol, exchange = 'NSE') {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const alphaSymbol = this.formatSymbol(symbol, exchange);
    const cacheKey = `alpha_balance_${alphaSymbol}`;
    
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for balance sheet: ${alphaSymbol}`);
      return cachedData;
    }

    const requestFunction = async () => {
      const params = {
        function: 'BALANCE_SHEET',
        symbol: alphaSymbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { 
        params,
        timeout: 15000
      });

      if (response.data['Error Message']) {
        throw new Error(`Alpha Vantage API Error: ${response.data['Error Message']}`);
      }

      if (response.data['Note']) {
        throw new Error('Alpha Vantage API rate limit exceeded. Please try again later.');
      }

      return response.data;
    };

    try {
      const rawData = await this.queueRequest(requestFunction);
      const processedData = this.processBalanceSheet(rawData);
      
      // Cache for 24 hours
      await setCache(cacheKey, processedData, 86400);
      
      logger.info(`Fetched balance sheet for ${alphaSymbol}`);
      return processedData;

    } catch (error) {
      logger.error(`Error fetching balance sheet for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch balance sheet for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Get cash flow statement data
   * @param {string} symbol - Stock symbol
   * @param {string} exchange - Exchange (NSE/BSE)
   * @returns {Object} Cash flow data
   */
  async getCashFlow(symbol, exchange = 'NSE') {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const alphaSymbol = this.formatSymbol(symbol, exchange);
    const cacheKey = `alpha_cashflow_${alphaSymbol}`;
    
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for cash flow: ${alphaSymbol}`);
      return cachedData;
    }

    const requestFunction = async () => {
      const params = {
        function: 'CASH_FLOW',
        symbol: alphaSymbol,
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseURL, { 
        params,
        timeout: 15000
      });

      if (response.data['Error Message']) {
        throw new Error(`Alpha Vantage API Error: ${response.data['Error Message']}`);
      }

      if (response.data['Note']) {
        throw new Error('Alpha Vantage API rate limit exceeded. Please try again later.');
      }

      return response.data;
    };

    try {
      const rawData = await this.queueRequest(requestFunction);
      const processedData = this.processCashFlow(rawData);
      
      // Cache for 24 hours
      await setCache(cacheKey, processedData, 86400);
      
      logger.info(`Fetched cash flow for ${alphaSymbol}`);
      return processedData;

    } catch (error) {
      logger.error(`Error fetching cash flow for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch cash flow for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Get comprehensive fundamental data for a stock
   * @param {string} symbol - Stock symbol
   * @param {string} exchange - Exchange (NSE/BSE)
   * @returns {Object} Comprehensive fundamental data
   */
  async getFundamentalData(symbol, exchange = 'NSE') {
    try {
      const [overview, incomeStatement, balanceSheet, cashFlow] = await Promise.allSettled([
        this.getCompanyOverview(symbol, exchange),
        this.getIncomeStatement(symbol, exchange),
        this.getBalanceSheet(symbol, exchange),
        this.getCashFlow(symbol, exchange)
      ]);

      const fundamentalData = {
        symbol: this.formatSymbol(symbol, exchange),
        lastUpdated: new Date().toISOString(),
        overview: overview.status === 'fulfilled' ? overview.value : null,
        incomeStatement: incomeStatement.status === 'fulfilled' ? incomeStatement.value : null,
        balanceSheet: balanceSheet.status === 'fulfilled' ? balanceSheet.value : null,
        cashFlow: cashFlow.status === 'fulfilled' ? cashFlow.value : null,
        errors: []
      };

      // Collect any errors
      [overview, incomeStatement, balanceSheet, cashFlow].forEach((result, index) => {
        if (result.status === 'rejected') {
          const dataTypes = ['overview', 'incomeStatement', 'balanceSheet', 'cashFlow'];
          fundamentalData.errors.push({
            dataType: dataTypes[index],
            error: result.reason.message
          });
        }
      });

      // Calculate derived metrics if we have the necessary data
      if (fundamentalData.overview && fundamentalData.incomeStatement && fundamentalData.balanceSheet) {
        fundamentalData.derivedMetrics = this.calculateDerivedMetrics(
          fundamentalData.overview,
          fundamentalData.incomeStatement,
          fundamentalData.balanceSheet
        );
      }

      logger.info(`Compiled fundamental data for ${symbol}`);
      return fundamentalData;

    } catch (error) {
      logger.error(`Error compiling fundamental data for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Process company overview data
   * @param {Object} rawData - Raw Alpha Vantage overview data
   * @returns {Object} Processed overview data
   */
  processCompanyOverview(rawData) {
    return {
      symbol: rawData.Symbol,
      name: rawData.Name,
      description: rawData.Description,
      exchange: rawData.Exchange,
      currency: rawData.Currency,
      country: rawData.Country,
      sector: rawData.Sector,
      industry: rawData.Industry,
      address: rawData.Address,
      fiscalYearEnd: rawData.FiscalYearEnd,
      latestQuarter: rawData.LatestQuarter,
      marketCapitalization: this.parseNumber(rawData.MarketCapitalization),
      ebitda: this.parseNumber(rawData.EBITDA),
      peRatio: this.parseNumber(rawData.PERatio),
      pegRatio: this.parseNumber(rawData.PEGRatio),
      bookValue: this.parseNumber(rawData.BookValue),
      dividendPerShare: this.parseNumber(rawData.DividendPerShare),
      dividendYield: this.parseNumber(rawData.DividendYield),
      eps: this.parseNumber(rawData.EPS),
      revenuePerShareTTM: this.parseNumber(rawData.RevenuePerShareTTM),
      profitMargin: this.parseNumber(rawData.ProfitMargin),
      operatingMarginTTM: this.parseNumber(rawData.OperatingMarginTTM),
      returnOnAssetsTTM: this.parseNumber(rawData.ReturnOnAssetsTTM),
      returnOnEquityTTM: this.parseNumber(rawData.ReturnOnEquityTTM),
      revenueTTM: this.parseNumber(rawData.RevenueTTM),
      grossProfitTTM: this.parseNumber(rawData.GrossProfitTTM),
      dilutedEPSTTM: this.parseNumber(rawData.DilutedEPSTTM),
      quarterlyEarningsGrowthYOY: this.parseNumber(rawData.QuarterlyEarningsGrowthYOY),
      quarterlyRevenueGrowthYOY: this.parseNumber(rawData.QuarterlyRevenueGrowthYOY),
      analystTargetPrice: this.parseNumber(rawData.AnalystTargetPrice),
      trailingPE: this.parseNumber(rawData.TrailingPE),
      forwardPE: this.parseNumber(rawData.ForwardPE),
      priceToSalesRatioTTM: this.parseNumber(rawData.PriceToSalesRatioTTM),
      priceToBookRatio: this.parseNumber(rawData.PriceToBookRatio),
      evToRevenue: this.parseNumber(rawData.EVToRevenue),
      evToEBITDA: this.parseNumber(rawData.EVToEBITDA),
      beta: this.parseNumber(rawData.Beta),
      week52High: this.parseNumber(rawData['52WeekHigh']),
      week52Low: this.parseNumber(rawData['52WeekLow']),
      day50MovingAverage: this.parseNumber(rawData['50DayMovingAverage']),
      day200MovingAverage: this.parseNumber(rawData['200DayMovingAverage']),
      sharesOutstanding: this.parseNumber(rawData.SharesOutstanding),
      dividendDate: rawData.DividendDate,
      exDividendDate: rawData.ExDividendDate
    };
  }

  /**
   * Process income statement data
   * @param {Object} rawData - Raw Alpha Vantage income statement data
   * @returns {Object} Processed income statement data
   */
  processIncomeStatement(rawData) {
    const annualReports = rawData.annualReports || [];
    const quarterlyReports = rawData.quarterlyReports || [];

    return {
      symbol: rawData.symbol,
      annualReports: annualReports.map(report => ({
        fiscalDateEnding: report.fiscalDateEnding,
        reportedCurrency: report.reportedCurrency,
        grossProfit: this.parseNumber(report.grossProfit),
        totalRevenue: this.parseNumber(report.totalRevenue),
        costOfRevenue: this.parseNumber(report.costOfRevenue),
        costofGoodsAndServicesSold: this.parseNumber(report.costofGoodsAndServicesSold),
        operatingIncome: this.parseNumber(report.operatingIncome),
        sellingGeneralAndAdministrative: this.parseNumber(report.sellingGeneralAndAdministrative),
        researchAndDevelopment: this.parseNumber(report.researchAndDevelopment),
        operatingExpenses: this.parseNumber(report.operatingExpenses),
        investmentIncomeNet: this.parseNumber(report.investmentIncomeNet),
        netInterestIncome: this.parseNumber(report.netInterestIncome),
        interestIncome: this.parseNumber(report.interestIncome),
        interestExpense: this.parseNumber(report.interestExpense),
        nonInterestIncome: this.parseNumber(report.nonInterestIncome),
        otherNonOperatingIncome: this.parseNumber(report.otherNonOperatingIncome),
        depreciation: this.parseNumber(report.depreciation),
        depreciationAndAmortization: this.parseNumber(report.depreciationAndAmortization),
        incomeBeforeTax: this.parseNumber(report.incomeBeforeTax),
        incomeTaxExpense: this.parseNumber(report.incomeTaxExpense),
        interestAndDebtExpense: this.parseNumber(report.interestAndDebtExpense),
        netIncomeFromContinuingOperations: this.parseNumber(report.netIncomeFromContinuingOperations),
        comprehensiveIncomeNetOfTax: this.parseNumber(report.comprehensiveIncomeNetOfTax),
        ebit: this.parseNumber(report.ebit),
        ebitda: this.parseNumber(report.ebitda),
        netIncome: this.parseNumber(report.netIncome)
      })),
      quarterlyReports: quarterlyReports.slice(0, 8).map(report => ({ // Last 8 quarters
        fiscalDateEnding: report.fiscalDateEnding,
        reportedCurrency: report.reportedCurrency,
        grossProfit: this.parseNumber(report.grossProfit),
        totalRevenue: this.parseNumber(report.totalRevenue),
        costOfRevenue: this.parseNumber(report.costOfRevenue),
        operatingIncome: this.parseNumber(report.operatingIncome),
        netIncome: this.parseNumber(report.netIncome),
        ebit: this.parseNumber(report.ebit),
        ebitda: this.parseNumber(report.ebitda)
      }))
    };
  }

  /**
   * Process balance sheet data
   * @param {Object} rawData - Raw Alpha Vantage balance sheet data
   * @returns {Object} Processed balance sheet data
   */
  processBalanceSheet(rawData) {
    const annualReports = rawData.annualReports || [];
    const quarterlyReports = rawData.quarterlyReports || [];

    return {
      symbol: rawData.symbol,
      annualReports: annualReports.map(report => ({
        fiscalDateEnding: report.fiscalDateEnding,
        reportedCurrency: report.reportedCurrency,
        totalAssets: this.parseNumber(report.totalAssets),
        totalCurrentAssets: this.parseNumber(report.totalCurrentAssets),
        cashAndCashEquivalentsAtCarryingValue: this.parseNumber(report.cashAndCashEquivalentsAtCarryingValue),
        cashAndShortTermInvestments: this.parseNumber(report.cashAndShortTermInvestments),
        inventory: this.parseNumber(report.inventory),
        currentNetReceivables: this.parseNumber(report.currentNetReceivables),
        totalNonCurrentAssets: this.parseNumber(report.totalNonCurrentAssets),
        propertyPlantEquipment: this.parseNumber(report.propertyPlantEquipment),
        accumulatedDepreciationAmortizationPPE: this.parseNumber(report.accumulatedDepreciationAmortizationPPE),
        intangibleAssets: this.parseNumber(report.intangibleAssets),
        intangibleAssetsExcludingGoodwill: this.parseNumber(report.intangibleAssetsExcludingGoodwill),
        goodwill: this.parseNumber(report.goodwill),
        investments: this.parseNumber(report.investments),
        longTermInvestments: this.parseNumber(report.longTermInvestments),
        shortTermInvestments: this.parseNumber(report.shortTermInvestments),
        otherCurrentAssets: this.parseNumber(report.otherCurrentAssets),
        otherNonCurrentAssets: this.parseNumber(report.otherNonCurrentAssets),
        totalLiabilities: this.parseNumber(report.totalLiabilities),
        totalCurrentLiabilities: this.parseNumber(report.totalCurrentLiabilities),
        currentAccountsPayable: this.parseNumber(report.currentAccountsPayable),
        deferredRevenue: this.parseNumber(report.deferredRevenue),
        currentDebt: this.parseNumber(report.currentDebt),
        shortTermDebt: this.parseNumber(report.shortTermDebt),
        totalNonCurrentLiabilities: this.parseNumber(report.totalNonCurrentLiabilities),
        capitalLeaseObligations: this.parseNumber(report.capitalLeaseObligations),
        longTermDebt: this.parseNumber(report.longTermDebt),
        currentLongTermDebt: this.parseNumber(report.currentLongTermDebt),
        longTermDebtNoncurrent: this.parseNumber(report.longTermDebtNoncurrent),
        shortLongTermDebtTotal: this.parseNumber(report.shortLongTermDebtTotal),
        otherCurrentLiabilities: this.parseNumber(report.otherCurrentLiabilities),
        otherNonCurrentLiabilities: this.parseNumber(report.otherNonCurrentLiabilities),
        totalShareholderEquity: this.parseNumber(report.totalShareholderEquity),
        treasuryStock: this.parseNumber(report.treasuryStock),
        retainedEarnings: this.parseNumber(report.retainedEarnings),
        commonStock: this.parseNumber(report.commonStock),
        commonStockSharesOutstanding: this.parseNumber(report.commonStockSharesOutstanding)
      })),
      quarterlyReports: quarterlyReports.slice(0, 4).map(report => ({ // Last 4 quarters
        fiscalDateEnding: report.fiscalDateEnding,
        reportedCurrency: report.reportedCurrency,
        totalAssets: this.parseNumber(report.totalAssets),
        totalCurrentAssets: this.parseNumber(report.totalCurrentAssets),
        totalLiabilities: this.parseNumber(report.totalLiabilities),
        totalCurrentLiabilities: this.parseNumber(report.totalCurrentLiabilities),
        totalShareholderEquity: this.parseNumber(report.totalShareholderEquity),
        cashAndCashEquivalentsAtCarryingValue: this.parseNumber(report.cashAndCashEquivalentsAtCarryingValue),
        longTermDebt: this.parseNumber(report.longTermDebt),
        currentDebt: this.parseNumber(report.currentDebt)
      }))
    };
  }

  /**
   * Process cash flow data
   * @param {Object} rawData - Raw Alpha Vantage cash flow data
   * @returns {Object} Processed cash flow data
   */
  processCashFlow(rawData) {
    const annualReports = rawData.annualReports || [];
    const quarterlyReports = rawData.quarterlyReports || [];

    return {
      symbol: rawData.symbol,
      annualReports: annualReports.map(report => ({
        fiscalDateEnding: report.fiscalDateEnding,
        reportedCurrency: report.reportedCurrency,
        operatingCashflow: this.parseNumber(report.operatingCashflow),
        paymentsForOperatingActivities: this.parseNumber(report.paymentsForOperatingActivities),
        proceedsFromOperatingActivities: this.parseNumber(report.proceedsFromOperatingActivities),
        changeInOperatingLiabilities: this.parseNumber(report.changeInOperatingLiabilities),
        changeInOperatingAssets: this.parseNumber(report.changeInOperatingAssets),
        depreciationDepletionAndAmortization: this.parseNumber(report.depreciationDepletionAndAmortization),
        capitalExpenditures: this.parseNumber(report.capitalExpenditures),
        changeInReceivables: this.parseNumber(report.changeInReceivables),
        changeInInventory: this.parseNumber(report.changeInInventory),
        profitLoss: this.parseNumber(report.profitLoss),
        cashflowFromInvestment: this.parseNumber(report.cashflowFromInvestment),
        cashflowFromFinancing: this.parseNumber(report.cashflowFromFinancing),
        proceedsFromRepaymentsOfShortTermDebt: this.parseNumber(report.proceedsFromRepaymentsOfShortTermDebt),
        paymentsForRepurchaseOfCommonStock: this.parseNumber(report.paymentsForRepurchaseOfCommonStock),
        paymentsForRepurchaseOfEquity: this.parseNumber(report.paymentsForRepurchaseOfEquity),
        paymentsForRepurchaseOfPreferredStock: this.parseNumber(report.paymentsForRepurchaseOfPreferredStock),
        dividendPayout: this.parseNumber(report.dividendPayout),
        dividendPayoutCommonStock: this.parseNumber(report.dividendPayoutCommonStock),
        dividendPayoutPreferredStock: this.parseNumber(report.dividendPayoutPreferredStock),
        proceedsFromIssuanceOfCommonStock: this.parseNumber(report.proceedsFromIssuanceOfCommonStock),
        proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: this.parseNumber(report.proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet),
        proceedsFromIssuanceOfPreferredStock: this.parseNumber(report.proceedsFromIssuanceOfPreferredStock),
        proceedsFromRepurchaseOfEquity: this.parseNumber(report.proceedsFromRepurchaseOfEquity),
        proceedsFromSaleOfTreasuryStock: this.parseNumber(report.proceedsFromSaleOfTreasuryStock),
        changeInCashAndCashEquivalents: this.parseNumber(report.changeInCashAndCashEquivalents),
        changeInExchangeRate: this.parseNumber(report.changeInExchangeRate),
        netIncome: this.parseNumber(report.netIncome)
      })),
      quarterlyReports: quarterlyReports.slice(0, 4).map(report => ({ // Last 4 quarters
        fiscalDateEnding: report.fiscalDateEnding,
        reportedCurrency: report.reportedCurrency,
        operatingCashflow: this.parseNumber(report.operatingCashflow),
        capitalExpenditures: this.parseNumber(report.capitalExpenditures),
        cashflowFromInvestment: this.parseNumber(report.cashflowFromInvestment),
        cashflowFromFinancing: this.parseNumber(report.cashflowFromFinancing),
        netIncome: this.parseNumber(report.netIncome),
        changeInCashAndCashEquivalents: this.parseNumber(report.changeInCashAndCashEquivalents)
      }))
    };
  }

  /**
   * Calculate derived financial metrics
   * @param {Object} overview - Company overview data
   * @param {Object} incomeStatement - Income statement data
   * @param {Object} balanceSheet - Balance sheet data
   * @returns {Object} Derived metrics
   */
  calculateDerivedMetrics(overview, incomeStatement, balanceSheet) {
    const latestIncome = incomeStatement.annualReports?.[0];
    const latestBalance = balanceSheet.annualReports?.[0];

    if (!latestIncome || !latestBalance) {
      return null;
    }

    const metrics = {};

    // Profitability Ratios
    if (latestIncome.totalRevenue && latestIncome.netIncome) {
      metrics.netProfitMargin = (latestIncome.netIncome / latestIncome.totalRevenue) * 100;
    }

    if (latestIncome.totalRevenue && latestIncome.grossProfit) {
      metrics.grossProfitMargin = (latestIncome.grossProfit / latestIncome.totalRevenue) * 100;
    }

    if (latestIncome.totalRevenue && latestIncome.operatingIncome) {
      metrics.operatingMargin = (latestIncome.operatingIncome / latestIncome.totalRevenue) * 100;
    }

    // Liquidity Ratios
    if (latestBalance.totalCurrentAssets && latestBalance.totalCurrentLiabilities) {
      metrics.currentRatio = latestBalance.totalCurrentAssets / latestBalance.totalCurrentLiabilities;
    }

    if (latestBalance.cashAndCashEquivalentsAtCarryingValue && latestBalance.totalCurrentLiabilities) {
      metrics.cashRatio = latestBalance.cashAndCashEquivalentsAtCarryingValue / latestBalance.totalCurrentLiabilities;
    }

    // Leverage Ratios
    if (latestBalance.totalLiabilities && latestBalance.totalShareholderEquity) {
      metrics.debtToEquityRatio = latestBalance.totalLiabilities / latestBalance.totalShareholderEquity;
    }

    if (latestBalance.longTermDebt && latestBalance.totalShareholderEquity) {
      metrics.longTermDebtToEquity = latestBalance.longTermDebt / latestBalance.totalShareholderEquity;
    }

    if (latestBalance.totalLiabilities && latestBalance.totalAssets) {
      metrics.debtRatio = latestBalance.totalLiabilities / latestBalance.totalAssets;
    }

    // Efficiency Ratios
    if (latestIncome.totalRevenue && latestBalance.totalAssets) {
      metrics.assetTurnover = latestIncome.totalRevenue / latestBalance.totalAssets;
    }

    if (latestIncome.netIncome && latestBalance.totalAssets) {
      metrics.returnOnAssets = (latestIncome.netIncome / latestBalance.totalAssets) * 100;
    }

    if (latestIncome.netIncome && latestBalance.totalShareholderEquity) {
      metrics.returnOnEquity = (latestIncome.netIncome / latestBalance.totalShareholderEquity) * 100;
    }

    // Growth Rates (if we have multiple years of data)
    if (incomeStatement.annualReports.length >= 2) {
      const currentRevenue = incomeStatement.annualReports[0].totalRevenue;
      const previousRevenue = incomeStatement.annualReports[1].totalRevenue;
      
      if (currentRevenue && previousRevenue) {
        metrics.revenueGrowthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      }

      const currentNetIncome = incomeStatement.annualReports[0].netIncome;
      const previousNetIncome = incomeStatement.annualReports[1].netIncome;
      
      if (currentNetIncome && previousNetIncome) {
        metrics.netIncomeGrowthRate = ((currentNetIncome - previousNetIncome) / previousNetIncome) * 100;
      }
    }

    // Financial Health Score (0-100)
    metrics.financialHealthScore = this.calculateFinancialHealthScore(metrics, overview);

    return metrics;
  }

  /**
   * Calculate a financial health score based on various metrics
   * @param {Object} metrics - Calculated financial metrics
   * @param {Object} overview - Company overview data
   * @returns {number} Financial health score (0-100)
   */
  calculateFinancialHealthScore(metrics, overview) {
    let score = 0;
    let factors = 0;

    // Profitability (30% weight)
    if (metrics.netProfitMargin !== undefined) {
      if (metrics.netProfitMargin > 15) score += 30;
      else if (metrics.netProfitMargin > 10) score += 25;
      else if (metrics.netProfitMargin > 5) score += 20;
      else if (metrics.netProfitMargin > 0) score += 10;
      factors++;
    }

    // Liquidity (20% weight)
    if (metrics.currentRatio !== undefined) {
      if (metrics.currentRatio > 2) score += 20;
      else if (metrics.currentRatio > 1.5) score += 15;
      else if (metrics.currentRatio > 1) score += 10;
      else if (metrics.currentRatio > 0.5) score += 5;
      factors++;
    }

    // Leverage (20% weight)
    if (metrics.debtToEquityRatio !== undefined) {
      if (metrics.debtToEquityRatio < 0.3) score += 20;
      else if (metrics.debtToEquityRatio < 0.6) score += 15;
      else if (metrics.debtToEquityRatio < 1) score += 10;
      else if (metrics.debtToEquityRatio < 2) score += 5;
      factors++;
    }

    // Growth (15% weight)
    if (metrics.revenueGrowthRate !== undefined) {
      if (metrics.revenueGrowthRate > 20) score += 15;
      else if (metrics.revenueGrowthRate > 10) score += 12;
      else if (metrics.revenueGrowthRate > 5) score += 8;
      else if (metrics.revenueGrowthRate > 0) score += 5;
      factors++;
    }

    // Efficiency (15% weight)
    if (metrics.returnOnEquity !== undefined) {
      if (metrics.returnOnEquity > 20) score += 15;
      else if (metrics.returnOnEquity > 15) score += 12;
      else if (metrics.returnOnEquity > 10) score += 8;
      else if (metrics.returnOnEquity > 5) score += 5;
      factors++;
    }

    // Normalize score based on available factors
    if (factors === 0) return 0;
    
    const normalizedScore = (score / factors) * (100 / 20); // Each factor contributes max 20 points
    return Math.min(Math.round(normalizedScore), 100);
  }

  /**
   * Parse string numbers from Alpha Vantage API
   * @param {string|number} value - Value to parse
   * @returns {number|null} Parsed number or null
   */
  parseNumber(value) {
    if (value === null || value === undefined || value === 'None' || value === '') {
      return null;
    }
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Get API usage statistics
   * @returns {Object} API usage info
   */
  getApiUsage() {
    return {
      hasApiKey: !!this.apiKey,
      rateLimitDelay: this.rateLimitDelay,
      queueLength: this.requestQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      lastRequestTime: this.lastRequestTime
    };
  }
}

module.exports = new AlphaVantageService();