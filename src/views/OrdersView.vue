<script setup>
import { computed, onMounted, ref, watch } from 'vue' // Добавлен watch
import { fetchOrders } from '@/api/orders.js'
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
const search = ref('')
const orders = ref([])
const error = ref(null)
const loading = ref(false)
const page = ref(1)
const itemsPerPage = ref(4)
const pageCount = computed(() => {
  return Math.ceil(orders.value.length / itemsPerPage.value)
})


const headers = [
  { title: 'Дата', key: 'date', align: 'start' },
  { title: 'Артикул', key: 'supplier_article' },
  { title: 'Сумма', key: 'total_price' },
  { title: 'Склад', key: 'warehouse_name' },
]


const CHART_COLORS = [
  '#4C8BF5', '#FF7043', '#66BB6A', '#26A69A', '#AB47BC',
  '#FFA726', '#8D6E63', '#EC407A', '#78909C', '#5C6BC0'
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
      text: 'Сумма заказов по складам',
      font: {
        size: 16
      },
      align: 'start',
    }
  },
})


const prepareChartData = (data) => {
  const warehouseTotals = {};

  data.forEach(item => {
    const warehouseName = item.warehouse_name;
    const totalPrice = item.total_price || 0;

    if (!warehouseTotals[warehouseName]) {
      warehouseTotals[warehouseName] = 0;
    }
    warehouseTotals[warehouseName] += totalPrice;
  });


  const labels = Object.keys(warehouseTotals).sort();
  const datasetData = labels.map(warehouse => warehouseTotals[warehouse]);
  const backgroundColors = labels.map(
    (_, index) => CHART_COLORS[index % CHART_COLORS.length]
  );

  chartData.value = {
    labels: labels,
    datasets: [
      {
        label: 'Сумма заказов (₽)',
        backgroundColor: backgroundColors,
        data: datasetData,
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };
};


async function getOrders() {

  loading.value = true
  error.value = null

  try{
    const { data } = await fetchOrders({dateFrom: dateFrom.value, dateTo: dateTo.value})
    orders.value = data.data
    page.value = 1
  }catch(err){
    error.value = err.response?.data?.message || err.message
  }finally {
    loading.value = false
  }
}

onMounted(() => {
  dateFrom.value = '2024-01-01'
  dateTo.value = '2025-07-29'
  getOrders()
})


watch(orders, (newOrders) => {
  prepareChartData(newOrders);
}, { deep: true });
</script>
<template>
  <div class="orders-container">
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
      :items="orders"
      :search="search"
      :items-per-page="itemsPerPage"
      :loading="loading"
      loading-text="Загрузка данных..."
      class="elevation-1"
      item-value="order_id"
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
.orders-container {
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
