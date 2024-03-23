import $api from "../http";
import {AxiosResponse} from "axios";
import {WishlistResponse} from "../models/response/WishlistResponse";
import {Dayjs} from "dayjs";

interface IWishlistServise {
    name: string;
    description: string;
    date: Dayjs | null;
    visible: number;
    uuid?: string;
}

export default class WishlistService {
    static  async create(params: IWishlistServise): Promise<AxiosResponse<WishlistResponse>> {
        return $api.post<WishlistResponse>('/api/wishlists/', {
            name: params.name,
            description: params.description,
            date: params.date,
            visible: params.visible
        })
    }

    static  async list(): Promise<AxiosResponse<WishlistResponse>> {
        return $api.get('/api/wishlists/' )
    }

    static  async get(uuid: string): Promise<AxiosResponse<WishlistResponse>> {
        return $api.get('/api/wishlists/' + uuid)
    }

    static  async update(params: IWishlistServise): Promise<AxiosResponse<WishlistResponse>> {
        return $api.post<WishlistResponse>('/api/wishlists/' + params.uuid, {
            name: params.name,
            description: params.description,
            date: params.date,
            visible: params.visible
        })
    }

    static  async delete(uuid: string): Promise<AxiosResponse<WishlistResponse>> {
        return $api.delete<WishlistResponse>('/api/wishlists/' + uuid)
    }
}

