<template>
  <div class="flex flex-col rounded-2xl border border-gray-700 rounded bg-gray-800 text-white p-4">
    <!-- Responsive container for title and dropdown -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-4 w-full">
      <!-- Dropdown for selecting metric type -->
      <select
        v-model="selectedMetric"
        class="text-white bg-gray-800 font-medium rounded px-3 py-2 focus:outline-none md:w-auto w-full"
        @change="changeMetricType"
      >
        <option
          value="messages"
          class="font-semibold"
        >
          Network Activity
        </option>
        <option value="stamps_dominance">
          % of Total (Stamps)
        </option>
        <option value="rares_dominance">
          % of Total (Rare Pepe)
        </option>
        <option value="other_dominance">
          % of Total (Other NFTs)
        </option>
        <!-- Popular Metrics -->
        <optgroup label="Popular">
          <option
            v-for="(metric, index) in popularMetrics"
            :key="index"
            :value="metric"
          >
            {{ formatSnakeCase(metric) }}
          </option>
        </optgroup>
        <!-- Remaining Metrics -->
        <optgroup label="Charts">
          <option
            v-for="(metric, index) in availableMetrics"
            :key="index"
            :value="metric"
          >
            {{ formatSnakeCase(metric) }}
          </option>
        </optgroup>
      </select>

      <!-- Control Buttons -->
      <div class="flex mt-4 md:mt-0 md:w-auto w-full">
        <button
          v-for="period in ['day', 'week', 'month', 'year']"
          :key="period"
          :class="buttonClasses(period)"
          class="text-base px-4 py-2 mx-1 rounded focus:outline-none focus:ring w-full md:w-auto"
          @click="changePeriod(period)"
        >
          {{ period.charAt(0).toUpperCase() + period.slice(1) }}
        </button>
      </div>
    </div>

    <!-- Chart Canvas -->
    <div
      ref="chartContainer"
      class="chart-container"
    >
      <canvas ref="chartRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Chart } from 'chart.js'

const { trackEvent } = useFathom()

const popularMetrics = [
  'sends', 'orders', 'issuances', 'dispensers',
]

const availableMetrics = [
  'issuances', 'sends', 'sweeps', 'orders', 'order_expirations',
  'order_matches', 'order_match_expirations', 'btcpays', 'cancels', 'dispensers',
  'dispenses', 'broadcasts', 'replace', 'rps', 'rps_expirations', 'rps_matches',
  'rps_match_expirations', 'rpsresolves', 'credits', 'debits', 'dividends',
  'destructions', 'dispenser_refills', 'burns', 'bets', 'bet_expirations',
  'bet_matches', 'bet_match_expirations', 'bet_match_resolutions',
]

availableMetrics.sort((a, b) => a.localeCompare(b))

const currentPeriodType = ref('day')
const selectedMetric = ref('messages')
const chartRef = ref(null)
let myChart = null

const fetchData = async (metricType, periodType) => {
  const url = `https://app.xcp.io/api/v1/metrics?period_type=${periodType}&metric_type=${metricType}`

  try {
    const response = await fetch(url)
    const { labels, datasets } = await response.json()

    // Set the default response color
    let responseColor = 'rgba(236, 21, 80, 0.5)' // Pinkish-red with 50% opacity

    // Change color to green if metricType is 'rares_dominance'
    if (metricType === 'rares_dominance') {
      responseColor = 'rgba(0, 128, 0, 0.75)' // Green with 50% opacity
    }

    datasets.forEach((dataset) => {
      dataset.borderColor = responseColor
      dataset.backgroundColor = responseColor.replace('0.5', '0.2') // Adjust opacity for background
      dataset.pointBorderColor = responseColor
      dataset.pointBackgroundColor = responseColor
      dataset.pointHoverBackgroundColor = responseColor.replace('0.5', '0.75') // Adjust opacity for hover background
      dataset.pointHoverBorderColor = responseColor.replace('0.5', '1') // Solid color for hover border
    })

    if (myChart) {
      myChart.destroy()
      myChart = null
    }

    const ctx = chartRef.value?.getContext('2d')
    if (ctx) {
      myChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          maintainAspectRatio: false, // Allow the chart to adjust its aspect ratio
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)', // Lighten grid lines for dark mode
              },
              ticks: {
                color: '#fff', // White text for the x-axis
              },
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)', // Lighten grid lines for dark mode
              },
              ticks: {
                color: '#fff', // White text for the y-axis
              },
              min: metricType.includes('_dominance') ? 0 : undefined,
              max: metricType.includes('_dominance') ? 100 : undefined,
            },
          },
          plugins: {
            legend: {
              labels: {
                color: '#fff', // White text for the legend
              },
            },
            tooltip: {
              titleColor: '#fff', // White text for the tooltip title
              bodyColor: '#fff', // White text for the tooltip body
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || ''

                  if (label) {
                    label += ': '
                  }
                  if (context.parsed.y !== null) {
                    if (metricType.includes('_dominance')) {
                      label += context.parsed.y + '%'
                    }
                    else {
                      label += context.parsed.y.toLocaleString()
                    }
                  }
                  return label
                },
              },
            },
          },
        },
      })
    }
  }
  catch (error) {
    console.error('Failed to fetch metrics or initialize chart:', error)
  }
}

const buttonClasses = (period) => {
  // Always include base classes
  let baseClasses = 'text-base px-4 py-2 mx-1 rounded focus:outline-none focus:ring w-full md:w-auto'

  // Determine button color based on whether the current period matches and the selected metric
  if (currentPeriodType.value === period) {
    // For 'rares_dominance', use 'bg-secondary', otherwise use 'bg-primary'
    baseClasses += selectedMetric.value === 'rares_dominance' ? ' bg-secondary hover:bg-secondary/80 font-medium' : ' bg-primary hover:bg-primary/80 font-medium'
  }
  else {
    // If not the current period, apply a different style (e.g., less emphasis)
    baseClasses += ' bg-white/10 hover:bg-white/20'
  }

  return baseClasses
}

const changePeriod = (period) => {
  trackEvent(`Period: ${period}`)
  currentPeriodType.value = period
  fetchData(selectedMetric.value, period)
}

const changeMetricType = (event) => {
  trackEvent(`Metric: ${event.target.value}`)
  selectedMetric.value = event.target.value
  fetchData(event.target.value, currentPeriodType.value)
}

onMounted(() => {
  fetchData(selectedMetric.value, currentPeriodType.value)
})

watch(currentPeriodType, (newPeriodType) => {
  fetchData(selectedMetric.value, newPeriodType)
}, { immediate: true })

watch(selectedMetric, (newMetric) => {
  fetchData(newMetric, currentPeriodType.value)
}, { immediate: true })
</script>

<style>
.chart-container {
  position: relative;
  height: 70vh; /* Adjust height as needed */
  width: 100%;
}
</style>
