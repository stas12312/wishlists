"use server";
import axios from "axios";
import { cookies } from "next/headers";

axios.defaults.baseURL = `${process.env.BASE_URL}/api`;
export const axiosInstance = axios.create({});
axiosInstance.interceptors.request.use(async (config) => {
  const cookieStore = await cookies();

  config.headers.Authorization = `Bearer ${cookieStore.get("access_token")?.value}`;

  return config;
});

axiosInstance.interceptors.response.use(
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
