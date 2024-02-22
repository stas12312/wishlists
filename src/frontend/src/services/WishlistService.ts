import $api from "../http";
import {AxiosResponse} from "axios";
import {WishlistResponse} from "../models/response/WishlistResponse";
import {Dayjs} from "dayjs";
import {IWish} from "../models/IWish";

interface IWishlistServise {
    name: string;
    description: string;
    date: Dayjs | null;
    uuid?: string;
}

export default class WishlistService {
    static  async create(params: IWishlistServise): Promise<AxiosResponse<WishlistResponse>> {
        return $api.post<WishlistResponse>('/api/wishlists/', {
            name: params.name,
            description: params.description,
            date: params.date
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
            date: params.date
        })
    }
}

