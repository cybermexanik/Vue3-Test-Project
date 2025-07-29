<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchSales } from '@/api/sales.js'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'


ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)


const dateFrom = ref('')
const dateTo = ref('')
const sales = ref([])
const search = ref('')
const error = ref(null)
const loading = ref(false)
const page = ref(1)
const itemsPerPage = ref(4)
const pageCount = computed(() => {
  return Math.ceil(sales.value.length / itemsPerPage.value)
})


const headers = [
  { title: 'Дата', key: 'date', sortable: true },
  { title: 'Артикул', key: 'supplier_article', sortable: true },
  { title: 'Сумма', key: 'total_price', sortable: true },
  { title: 'Склад', key: 'warehouse_name', sortable: true }
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
      text: 'Сумма продаж по складам',
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
        text: 'Сумма (₽)'
      },
      beginAtZero: true
    }
  }
})


const prepareChartData = (data) => {
  const warehousePrices = {}

  data.forEach((item) => {
    const warehouseName = item.warehouse_name
    if(!warehousePrices[warehouseName]) {
      warehousePrices[warehouseName] = 0
    }
    warehousePrices[warehouseName] += item.total_price
  })


  const sortedWarehouses = Object.keys(warehousePrices).sort()
  const labels = sortedWarehouses
  const datasetData = sortedWarehouses.map(warehouse => warehousePrices[warehouse])

  chartData.value = {
    labels: labels,
    datasets: [
      {
        label:'Сумма продаж (₽)',
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


async function getSales() {

  loading.value = true
  error.value = null

  try{
    const { data } = await fetchSales({ dateFrom: dateFrom.value, dateTo: dateTo.value })
    sales.value = data.data
    page.value = 1
  }catch(err){
    error.value = err.response?.data?.message || err.message
  }finally {
    loading.value = false
  }
}

onMounted(() => {
  dateFrom.value = '2024-01-01'
  dateTo.value = '2024-12-03'
  getSales()
})

watch(sales, (newSales) => {
  prepareChartData(newSales)
}, { deep: true })
</script>

<template>
  <div class="sales-container">
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
      <Bar :data="chartData" :options="chartOptions" />
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
      :items="sales"
      :search="search"
      :items-per-page="itemsPerPage"
      :loading="loading"
      loading-text="Загрузка данных..."
      class="elevation-1"
      item-value="sale_id"
      v-model:page="page"
      must-sort
      multi-sort
    >

      <template #item-total_price="{ item }">
        {{ item.total_price }} ₽
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
.sales-container {
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
