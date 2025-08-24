<template>
  <div class="relative">
    <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  data: number[]
  labels?: string[]
  color?: string
  width?: number
  height?: number
  type?: 'line' | 'bar'
}

const props = withDefaults(defineProps<Props>(), {
  color: '#3B82F6',
  width: 300,
  height: 150,
  type: 'line'
})

const chartCanvas = ref<HTMLCanvasElement>()

const drawChart = () => {
  if (!chartCanvas.value || !props.data.length) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const padding = 20
  const chartWidth = canvas.width - padding * 2
  const chartHeight = canvas.height - padding * 2

  // Find min and max values
  const minValue = Math.min(...props.data)
  const maxValue = Math.max(...props.data)
  const valueRange = maxValue - minValue || 1

  // Calculate points
  const points = props.data.map((value, index) => ({
    x: padding + (index / (props.data.length - 1)) * chartWidth,
    y: padding + chartHeight - ((value - minValue) / valueRange) * chartHeight
  }))

  if (props.type === 'line') {
    // Draw line chart
    ctx.strokeStyle = props.color
    ctx.lineWidth = 2
    ctx.beginPath()
    
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    
    ctx.stroke()

    // Draw points
    ctx.fillStyle = props.color
    points.forEach(point => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })
  } else {
    // Draw bar chart
    const barWidth = chartWidth / props.data.length * 0.8
    const barSpacing = chartWidth / props.data.length * 0.2

    ctx.fillStyle = props.color
    props.data.forEach((value, index) => {
      const barHeight = ((value - minValue) / valueRange) * chartHeight
      const x = padding + index * (barWidth + barSpacing)
      const y = padding + chartHeight - barHeight
      
      ctx.fillRect(x, y, barWidth, barHeight)
    })
  }
}

onMounted(() => {
  drawChart()
})

watch(() => props.data, () => {
  drawChart()
}, { deep: true })
</script>
</template>