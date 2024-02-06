import {IWishList} from "../IWish";

export interface WishlistResponse {
    access_token: string;
    refresh_token: string;
    wishlist: IWishList;

}