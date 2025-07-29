import axios from './axiosInstance.js'

export const fetchIncomes = ({ dateFrom, dateTo }) => {
  return axios.get('/incomes', { params: { dateFrom, dateTo } })
    .then(response => {
      console.log('API response: ', response.data)
      return response
    })
}
