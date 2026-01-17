import axios from "axios";

import { IError } from "../models";
import { IRegisterData, ITokens } from "../models/auth";

import { clientAxios } from "./base";

export const authAxios = axios.create({});

authAxios.defaults.baseURL = `${process.env.NEXT_PUBLIC_BASE_URL}/api`;

authAxios.interceptors.response.use(
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

export async function refreshTokens(): Promise<ITokens | IError> {
  const response = await authAxios.post("/auth/refresh");
  return response.data;
}

export async function login(
  email: string,
  password: string,
): Promise<ITokens | IError> {
  const response = await authAxios.post("/auth/login", {
    email: email,
    password: password,
  });

  return response.data;
}

export async function logout() {
  await authAxios.post("/auth/logout");
}

export async function register(
  name: string,
  password: string,
  email: string,
): Promise<IRegisterData | IError> {
  const response = await authAxios.post("/auth/register", {
    email: email,
    name: name,
    password: password,
  });

  return response.data;
}

export async function confirmEmail(
  uuid: string,
  code?: string,
  secret_key?: string,
  key?: string,
): Promise<ITokens | IError> {
  const response = await authAxios.post("/auth/confirm", {
    uuid: uuid,
    code: code,
    key: key,
    secret_key: secret_key,
  });

  return response.data;
}

export async function authRequest(
  email: string,
  password: string,
): Promise<ITokens> {
  const response = await authAxios.post("/auth/login", {
    email: email,
    password: password,
  });

  return response.data;
}

export async function restorePassword(email: string): Promise<IRegisterData> {
  const response = await authAxios.post("/auth/restore", {
    email: email,
  });

  return response.data;
}

export async function checkCode(
  registerData: IRegisterData,
  code: string,
): Promise<object | IError> {
  const response = await authAxios.post("/auth/check-code/", {
    uuid: registerData.uuid,
    code: code,
    secret_key: registerData.secret_key,
  });

  return response.data;
}

export async function resetPassword(
  registerData: IRegisterData,
  password: string,
  code?: string,
): Promise<ITokens | IError> {
  const response = await clientAxios.post("/auth/reset-password/", {
    ...registerData,
    code: code,
    password: password,
  });

  return response.data;
}

export async function OAuth(
  type: string,
  token: string,
): Promise<ITokens | IError> {
  const response = await authAxios.post("/auth/oauth", {
    type: type,
    token: token,
  });

  return response.data;
}
