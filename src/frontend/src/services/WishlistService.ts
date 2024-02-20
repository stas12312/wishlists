import $api from "../http";
import {AxiosResponse} from "axios";
import {WishlistResponse} from "../models/response/WishlistResponse";
import {Dayjs} from "dayjs";
import {IWish} from "../models/IWish";

export default class WishlistService {
    static  async create(name: string, description: string, date: Dayjs | null): Promise<AxiosResponse<WishlistResponse>> {
        return $api.post<WishlistResponse>('/api/wishlists/', {name, description, date})
    }

    static  async list(): Promise<AxiosResponse<WishlistResponse>> {
        return $api.get('/api/wishlists/' )
    }

    static  async get(uuid: string, name: string, description: string, date: string): Promise<AxiosResponse<WishlistResponse>> {
        return $api.get('/api/wishlists/' + uuid, {
            data: {
                name,
                description,
                date
            }
        })
    }

    static  async update(params: IWish): Promise<AxiosResponse<WishlistResponse>> {
        return $api.post<WishlistResponse>('/api/wishlists/' + params.uuid, {
            uuid: params.uuid,
            name: params.name,
            description: params.description,
            date: params.date,
            user_id: params.user_id,
            is_active: true})
    }
}

