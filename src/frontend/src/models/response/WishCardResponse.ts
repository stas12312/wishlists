import {Dayjs} from "dayjs";

export interface WishCardResponse {
    data: {
        uuid: string;
        name: string;
        description: string;
        created_at: Dayjs;
        date: Dayjs;
        user_id: number;
        is_active: boolean;
        wishes_count: number;
        visible: number;
    }
}