import axios from './axiosInstance.js'

export const fetchOrders = ({dateFrom, dateTo}) => {
  return axios.get('/orders', {params: {dateFrom, dateTo}})
    .then(response => {
      console.log('API response: ', response.data)
      return response
    })
}
