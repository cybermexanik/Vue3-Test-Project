<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchStocks } from '@/api/stocks.js'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'


ChartJS.register(Title, Tooltip, Legend, ArcElement)


const dateFrom = ref('')
const dateTo = ref('')
const stocks = ref([])
const loading = ref(false)
const search = ref('')
const error = ref(null)
const page = ref(1)
const itemsPerPage = ref(4)
const pageCount = computed(() => {
  return Math.ceil(stocks.value.length / itemsPerPage.value)
})


const headers = [
  { title: 'Дата', key: 'date', align: 'start' },
  { title: 'Артикул', key: 'supplier_article' },
  { title: 'Количество', key: 'quantity'  },
  { title: 'Склад', key: 'warehouse_name' },
]


const CHART_COLORS = [
  '#2563eb', '#0d9488', '#d97706', '#be123c', '#4f46e5',
  '#16a34a', '#6b7280', '#c026d3', '#ea580c', '#0891b2'
];


const chartData = ref({
  labels: [],
  datasets: []
})


const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false
    },
    title: {
      display: true,
      text: 'Распределение количества товаров по складам',
      font: {
        size: 16
      },
      align: 'start',
    }
  },
})


const prepareChartData = (data) => {
  const warehouseQuantities = {};

  data.forEach(item => {
    const warehouseName = item.warehouse_name;
    const quantity = item.quantity || 0;

    if (!warehouseQuantities[warehouseName]) {
      warehouseQuantities[warehouseName] = 0;
    }
    warehouseQuantities[warehouseName] += quantity;
  });


  const labels = Object.keys(warehouseQuantities).sort();
  const datasetData = labels.map(warehouse => warehouseQuantities[warehouse]);
  const backgroundColors = labels.map(
    (_, index) => CHART_COLORS[index % CHART_COLORS.length]
  );

  chartData.value = {
    labels: labels,
    datasets: [
      {
        label: 'Количество товаров (шт)',
        backgroundColor: backgroundColors,
        data: datasetData,
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };
};

async function getStocks() {
  loading.value = true
  error.value = null

  try {
    const { data } = await fetchStocks({dateFrom: dateFrom.value, dateTo: dateTo.value})
    stocks.value = data.data
    page.value = 1
  } catch(err) {
    error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().slice(0, 10)

  dateFrom.value = todayStr
  dateTo.value = nextWeekStr

  getStocks()
})

watch(stocks, (newStocks) => {
  prepareChartData(newStocks);
}, { deep: true });
</script>

<template>
  <div class="stocks-container">
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
      <Doughnut :data="chartData" :options="chartOptions" />
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
      :items="stocks"
      :search="search"
      :items-per-page="itemsPerPage"
      :loading="loading"
      loading-text="Загрузка данных..."
      class="elevation-1"
      item-value="stock_id"
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
.stocks-container {
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
