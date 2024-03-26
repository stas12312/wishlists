import {IWish} from "../IWish";
import {Dayjs} from "dayjs";

export interface WishlistResponse {
    access_token?: string;
    refresh_token?: string;
    data: IWish[];
}
