import { ref, computed, type Ref } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration,
  type ChartData,
  type ChartOptions
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function useChart() {
  const isDark = ref(false)

  // Common chart options
  const baseOptions = computed((): ChartOptions => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: isDark.value ? '#e5e7eb' : '#374151',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: isDark.value ? '#1f2937' : '#ffffff',
        titleColor: isDark.value ? '#f9fafb' : '#111827',
        bodyColor: isDark.value ? '#e5e7eb' : '#374151',
        borderColor: isDark.value ? '#374151' : '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark.value ? '#374151' : '#f3f4f6'
        },
        ticks: {
          color: isDark.value ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        grid: {
          color: isDark.value ? '#374151' : '#f3f4f6'
        },
        ticks: {
          color: isDark.value ? '#9ca3af' : '#6b7280'
        }
      }
    }
  }))

  // Create line chart configuration
  function createLineChart(
    labels: string[],
    datasets: Array<{
      label: string
      data: number[]
      borderColor?: string
      backgroundColor?: string
      fill?: boolean
    }>,
    options?: Partial<ChartOptions>
  ): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map(dataset => ({
          ...dataset,
          borderColor: dataset.borderColor || '#3b82f6',
          backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: dataset.fill ?? false,
          tension: 0.1
        }))
      },
      options: {
        ...baseOptions.value,
        ...options
      }
    }
  }

  // Create bar chart configuration
  function createBarChart(
    labels: string[],
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
    }>,
    options?: Partial<ChartOptions>
  ): ChartConfiguration {
    return {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map(dataset => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor || '#3b82f6',
          borderColor: dataset.borderColor || '#2563eb',
          borderWidth: 1
        }))
      },
      options: {
        ...baseOptions.value,
        ...options
      }
    }
  }

  // Create pie chart configuration
  function createPieChart(
    labels: string[],
    data: number[],
    colors?: string[],
    options?: Partial<ChartOptions>
  ): ChartConfiguration {
    const defaultColors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ]

    return {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors || defaultColors.slice(0, data.length),
          borderWidth: 2,
          borderColor: isDark.value ? '#1f2937' : '#ffffff'
        }]
      },
      options: {
        ...baseOptions.value,
        ...options,
        scales: undefined // Remove scales for pie chart
      }
    }
  }

  // Create doughnut chart configuration
  function createDoughnutChart(
    labels: string[],
    data: number[],
    colors?: string[],
    options?: Partial<ChartOptions>
  ): ChartConfiguration {
    const config = createPieChart(labels, data, colors, options)
    config.type = 'doughnut'
    return config
  }

  // Price chart with candlestick-like appearance using line chart
  function createPriceChart(
    labels: string[],
    prices: number[],
    volumes?: number[],
    options?: Partial<ChartOptions>
  ): ChartConfiguration {
    const datasets: any[] = [
      {
        label: 'Price',
        data: prices,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        yAxisID: 'y'
      }
    ]

    if (volumes) {
      datasets.push({
        label: 'Volume',
        data: volumes,
        type: 'bar',
        backgroundColor: 'rgba(156, 163, 175, 0.3)',
        borderColor: 'rgba(156, 163, 175, 0.5)',
        yAxisID: 'y1'
      })
    }

    return {
      type: 'line',
      data: {
        labels,
        datasets
      },
      options: {
        ...baseOptions.value,
        scales: {
          ...baseOptions.value.scales,
          y1: volumes ? {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
              color: isDark.value ? '#374151' : '#f3f4f6'
            },
            ticks: {
              color: isDark.value ? '#9ca3af' : '#6b7280'
            }
          } : undefined
        },
        ...options
      }
    }
  }

  // Quality score radar chart
  function createQualityRadarChart(
    dimensions: Record<string, number>,
    options?: Partial<ChartOptions>
  ): ChartConfiguration {
    const labels = Object.keys(dimensions).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1)
    )
    const data = Object.values(dimensions)

    return {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Quality Score',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        ...baseOptions.value,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: isDark.value ? '#374151' : '#f3f4f6'
            },
            angleLines: {
              color: isDark.value ? '#374151' : '#f3f4f6'
            },
            pointLabels: {
              color: isDark.value ? '#e5e7eb' : '#374151'
            },
            ticks: {
              color: isDark.value ? '#9ca3af' : '#6b7280',
              stepSize: 20
            }
          }
        },
        ...options
      }
    }
  }

  // Update theme
  function updateTheme(dark: boolean) {
    isDark.value = dark
  }

  return {
    createLineChart,
    createBarChart,
    createPieChart,
    createDoughnutChart,
    createPriceChart,
    createQualityRadarChart,
    updateTheme
  }
}