import $api from "../http";
import {AxiosResponse} from "axios";
import {WishCardResponse} from "../models/response/WishCardResponse";
import {WishlistResponse} from "../models/response/WishlistResponse";

interface IWishCardService {
    name: string;
    wishlist_uuid: string;
    image: string;
    comment: string;
    cost: number;
}

export default class WishCardService {
    static  async create(params: IWishCardService): Promise<AxiosResponse<WishlistResponse>> {
        return $api.post<WishlistResponse>('/api/wishes/', {
            name: params.name,
            wishlist_uuid: params.wishlist_uuid,
            image: params.image,
            comment: params.comment,
            cost: params.cost
        })
    }

    static  async list(): Promise<AxiosResponse<WishlistResponse>> {
        return $api.get('/api/wishlists/' )
    }

    static  async get(uuid: string): Promise<AxiosResponse<WishCardResponse>> {
        return $api.get('/api/wishlists/' + uuid)
    }

    static  async get_wishes(uuid: string): Promise<AxiosResponse<WishlistResponse>> {
        return $api.get(`/api/wishlists/${uuid}/wishes/`);
    }
}

