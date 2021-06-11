import axios from 'axios'

const api = axios.create({
    baseURL: '10.1.1.19:5555'
    
})

export default api;