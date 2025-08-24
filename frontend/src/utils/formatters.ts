// Utility functions for formatting data in the application

/**
 * Format currency values
 */
export function formatCurrency(value: number, currency: string = 'INR'): string {
  if (isNaN(value)) return '₹0.00'
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLargeNumber(value: number): string {
  if (isNaN(value)) return '0'
  
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  
  if (absValue >= 1e12) {
    return `${sign}${(absValue / 1e12).toFixed(1)}T`
  } else if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(1)}B`
  } else if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(1)}M`
  } else if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(1)}K`
  }
  
  return `${sign}${absValue.toFixed(0)}`
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0.00%'
  
  return `${value.toFixed(decimals)}%`
}

/**
 * Format percentage with color class
 */
export function formatPercentageWithColor(value: number, decimals: number = 2): { 
  text: string
  colorClass: string 
} {
  const text = formatPercentage(value, decimals)
  let colorClass = 'text-gray-600'
  
  if (value > 0) {
    colorClass = 'text-success-600'
  } else if (value < 0) {
    colorClass = 'text-danger-600'
  }
  
  return { text, colorClass }
}

/**
 * Format date and time
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date'
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    case 'time':
      return dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    default:
      return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return formatDate(dateObj, 'short')
  }
}

/**
 * Format stock symbol for display
 */
export function formatStockSymbol(symbol: string): string {
  return symbol.toUpperCase().replace(/\.(NS|BO)$/, '')
}

/**
 * Get recommendation color class
 */
export function getRecommendationColor(recommendation: string): string {
  switch (recommendation.toLowerCase()) {
    case 'strong_buy':
      return 'text-success-700 bg-success-100'
    case 'buy':
      return 'text-success-600 bg-success-50'
    case 'hold':
      return 'text-yellow-600 bg-yellow-50'
    case 'sell':
      return 'text-danger-600 bg-danger-50'
    case 'strong_sell':
      return 'text-danger-700 bg-danger-100'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Get quality grade color class
 */
export function getQualityGradeColor(grade: string): string {
  switch (grade.toLowerCase()) {
    case 'excellent':
      return 'text-success-700 bg-success-100'
    case 'good':
      return 'text-success-600 bg-success-50'
    case 'average':
      return 'text-yellow-600 bg-yellow-50'
    case 'poor':
      return 'text-danger-600 bg-danger-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Get evaluation color class
 */
export function getEvaluationColor(evaluation: string): string {
  switch (evaluation.toLowerCase()) {
    case 'undervalued':
      return 'text-success-700 bg-success-100'
    case 'fairly valued':
      return 'text-primary-600 bg-primary-50'
    case 'overvalued':
      return 'text-yellow-600 bg-yellow-50'
    case 'severely overvalued':
      return 'text-danger-700 bg-danger-100'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Get trend direction color and icon
 */
export function getTrendIndicator(direction: string): { 
  colorClass: string
  icon: string 
} {
  switch (direction.toLowerCase()) {
    case 'improving':
      return {
        colorClass: 'text-success-600',
        icon: '↗'
      }
    case 'declining':
      return {
        colorClass: 'text-danger-600',
        icon: '↘'
      }
    case 'stable':
      return {
        colorClass: 'text-gray-600',
        icon: '→'
      }
    default:
      return {
        colorClass: 'text-gray-400',
        icon: '?'
      }
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}