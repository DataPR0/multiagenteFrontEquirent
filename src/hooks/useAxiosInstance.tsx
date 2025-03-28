import axios from 'axios';
import { API_URL } from '../utils/api';

axios.defaults.withCredentials = true

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.response.use(
    
(response) => response,
    async (error) => {
        console.log("hola desde axios instance")
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;
            try{
                await axios.post(`${API_URL}/auth/refresh`);
                return axios(originalRequest);
            } catch(error){
                console.log(error)
            }
        }
        return Promise.reject(error);
    }
)

export default api;