import axios from 'axios';

export const API_URL = 'https://test-wishlists.sv-rush.ru';

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
})

$api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
    return config;
})

export default $api;