import axios from "axios";

import { authManager } from "../clientAuth";

export const clientAxios = axios.create({});

clientAxios.defaults.baseURL = `${process.env.NEXT_PUBLIC_BASE_URL}/api`;
clientAxios.interceptors.request.use(async (config) => {
  const access_token = await authManager.getAccessToken();
  config.headers.Authorization = `Bearer ${access_token}`;

  return config;
});

clientAxios.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    if (error.response.status == 403) {
    } else if (![400, 404, 500].includes(error.response.status)) {
      return Promise.reject(error);
    }
    return error.response;
  },
);
