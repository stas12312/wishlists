import {IWish} from "../IWish";

export interface WishlistResponse {
    access_token: string;
    refresh_token: string;
    data: IWish[];
}