import $api from "../http";
import {AxiosResponse} from "axios";
import {WishlistResponse} from "../models/response/WishlistResponse";
import {Dayjs} from "dayjs";

export default class WishlistService {
    static  async create(name: string, description: string, date: Dayjs | null): Promise<AxiosResponse<WishlistResponse>> {
        return $api.post<WishlistResponse>('/api/wishlists/', {name, description, date})
    }

    static  async list(): Promise<AxiosResponse<WishlistResponse>> {
        return $api.get('/api/wishlists/' )
    }

    static  async get(): Promise<AxiosResponse<WishlistResponse>> {
        return $api.get('/api/wishlists/:uuid')
    }

    static  async update(uuid: string, name: string, description: string, date: string): Promise<AxiosResponse<WishlistResponse>> {
        return $api.post<WishlistResponse>('/api/wishlists/:uuid', {uuid, name, description, date})
    }
}

