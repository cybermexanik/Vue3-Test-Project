import axios from './axiosInstance.js';

export const fetchSales = ({dateFrom, dateTo}) => {
  return axios.get('/sales', {params: {dateFrom, dateTo}})
    .then(response => {
      console.log('API response: ', response.data)
      return response
    })
}
