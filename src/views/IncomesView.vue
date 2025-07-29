<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { fetchIncomes } from '@/api/incomes'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js'


ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)


const dateFrom = ref('')
const dateTo = ref('')
const incomes = ref([])
const loading = ref(false)
const search = ref('')
const error = ref(null)
const page = ref(1)
const itemsPerPage = ref(4)
const pageCount = computed(() => {
  return Math.ceil(incomes.value.length / itemsPerPage.value)
})


const headers = [
  { title: 'Дата', key: 'date', align: 'start' },
  { title: 'Артикул', key: 'supplier_article' },
  { title: 'Количество', key: 'quantity' },
  { title: 'Склад', key: 'warehouse_name' },
]


const chartData = ref({
  labels: [],
  datasets: []
})


const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins:{
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    },
    title: {
      display: true,
      text: 'Динамика доходов по датам',
      font:{
        size: 16
      },
      align: 'start'
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Склад'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Количество (шт)'
      },
      beginAtZero: true
    }
  }
})


const prepareChartData = (data) => {
  const warehouseQuantities = {}

  data.forEach((item) => {
    const warehouseName = item.warehouse_name
    if(!warehouseQuantities[warehouseName]) {
      warehouseQuantities[warehouseName] = 0
    }
    warehouseQuantities[warehouseName] += item.quantity
  })


  const sortedWarehouses = Object.keys(warehouseQuantities).sort()
  const labels = sortedWarehouses
  const datasetData = sortedWarehouses.map(warehouse => warehouseQuantities[warehouse])

  chartData.value = {
    labels: labels,
    datasets: [
      {
        label:'Количество товара (шт)',
        backgroundColor: 'rgba(66, 185, 131, 0.5)',
        borderColor: '#42b983',
        data: datasetData,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#42b983',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#42b983',
      }
    ]
  }
}


async function getIncomes() {

  loading.value = true
  error.value = null

  try {
    const { data } = await fetchIncomes({ dateFrom: dateFrom.value, dateTo: dateTo.value })
    incomes.value = data.data
    page.value = 1
  } catch (err) {
    error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }

}

onMounted(() => {
  dateFrom.value = '2024-01-01'
  dateTo.value = '2024-12-03'
  getIncomes()
})

watch(incomes, (newIncomes) => {
  prepareChartData(newIncomes)
}, {deep: true})
</script>

<template>
  <div class="incomes-container">
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="dateFrom"
          type="date"
          label="Дата от"
          density="compact"
          hide-details
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="dateTo"
          type="date"
          label="Дата до"
          density="compact"
          hide-details
        />
      </v-col>
    </v-row>

    <v-card class="mb-4 pa-4 elevation-1 chart-card">
      <Line :data="chartData" :options="chartOptions" />
    </v-card>

    <v-text-field
      v-model="search"
      label="Поиск"
      prepend-inner-icon="mdi-magnify"
      class="mb-4"
      density="compact"
      hide-details
    />

    <v-data-table
      :headers="headers"
      :items="incomes"
      :search="search"
      :items-per-page="4"
      :loading="loading"
      loading-text="Загрузка данных..."
      class="elevation-1"
      item-value="income_id"
      v-model:page="page"
      must-sort
      multi-sort
    >

    <template #item-quantity="{ item }">
      {{ item.quantity }} шт
    </template>

    <template #bottom>
      <div class="d-flex justify-center align-center pa-2">
        <v-pagination
        v-model="page"
        :length="pageCount"
        :total-visible="5"
        prev-icon="mdi-chevron-left"
        next-icon="mdi-chevron-right"
        />
      </div>
    </template>

    <template #no-data>
      <v-alert type="info" class="ma-4">
        Нет данных для отображения.
      </v-alert>
    </template>

    </v-data-table>

    <v-alert v-if="error" type="error" class="mt-4">
      Ошибка: {{ error }}
    </v-alert>
  </div>
</template>


<style scoped>
.incomes-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chart-card {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
