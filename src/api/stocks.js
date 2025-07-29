import axios from './axiosInstance.js';

export const fetchStocks = ({dateFrom, dateTo}) => {
  return axios.get('/stocks', { params: {dateFrom, dateTo}})
    .then(response => {
      console.log('API response: ', response.data)
      return response
    })
}
