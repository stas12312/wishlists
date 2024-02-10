import axios from 'axios';

const $api = axios.create({
    withCredentials: true,
    baseURL: process.env.API_URL,
    timeout: 1000

})

$api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
    return config;
})

export default $api;