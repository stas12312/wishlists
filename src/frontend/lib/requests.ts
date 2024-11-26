"use server"
import axios from "axios"
import { IWishlist, IWish, IUser, IRegisterData, ITokens, IError } from "./models"
import { cookies } from 'next/headers';
import { m } from "framer-motion";

axios.defaults.baseURL = `${process.env.BASE_URL}/api`
const axiosInstance = axios.create({
})


axiosInstance.interceptors.request.use(async (config) => {
    const cookieStore = await cookies()
    config.headers.Authorization = `Bearer ${cookieStore.get("access_token")?.value}`
    return config
})

axiosInstance.interceptors.response.use(async (response) => {
    return response;
  }, async (error) => {
    console.log(error.response.status, error.response.data)
    if (error.response.code == 403) {
      console.log("Ошибка авторизации")
    }
    else if (![400, 500].includes(error.status)) {
      return Promise.reject(error);
    }
    return error.response
  });




export async function getWishlists(): Promise<IWishlist[]> {
    const response = await axiosInstance.get(
        "/wishlists"
    )
    return response.data.data

}

export async function getWishes(wishlist_uuid: string): Promise<IWish[]> {
  const response = await axiosInstance.get(
    `/wishlists/${wishlist_uuid}/wishes`
  )
  return response.data.data
}

export async function getUser(): Promise<IUser> {
  const response = await axiosInstance.get(
    "/user/me"
  )
  return response.data
}

export async function getWishlist(uuid: string): Promise<IWishlist> {
  const response = await axiosInstance.get(
    `/wishlists/${uuid}`
  )
  return response.data.data
}

export async function register(name: string, password: string, email: string): Promise<IRegisterData | IError>{
  const response = await axiosInstance.post(
    "/auth/register",
    {
      "email": email,
      "name": name,
      "password": password,
    }
  )
  return response.data
}

export async function confirmEmail(uuid: string, code?: string, secret_key?: string, key?:string): Promise<ITokens | IError> {
  console.log(uuid, code, secret_key)
  const response = await axiosInstance.post(
    "/auth/confirm",
    {
      "uuid": uuid,
      "code": code,
      "secret_key": secret_key,
    }
  )
  return response.data
}

export async function createWishList(wishlist: IWishlist): Promise<IWishlist> {
  const response = await axiosInstance.post(
    "/wishlists",
    wishlist,
  )
  return response.data.data
}

export async function updateWishlist(wishlist: IWishlist): Promise<IWishlist> {
  const response = await axiosInstance.post(
    `/wishlists/${wishlist.uuid}`,
    wishlist
  )

  return response.data.data
  
}

export async function createWish(wish: IWish): Promise<IWish | IError> {
  const response = await axiosInstance.post(
    "/wishes",
    wish,
  )
  if (response.status != 200) {
    return response.data as IError
  }
  return response.data.data as IWish;
}

export async function updateWish(wish: IWish): Promise<IWish | IError> {
  const response = await axiosInstance.post(
    `/wishes/${wish.uuid}`,
    wish,
  )
  return response.data

}

export async function deleteWish(wishUUID: string) {
  await axiosInstance.delete(`/wishes/${wishUUID}`)
}

export async function deleteWishlist(wishlistUUID: string) {
  await axiosInstance.delete(`/wishlists/${wishlistUUID}`)
}

export async function authRequest(email: string, password: string): Promise<ITokens>{
  const response = await axiosInstance.post(
      "https://test.mywishlists.ru/api/auth/login",
      {
          email: email,
          password: password,
      }
  )
  return response.data
}