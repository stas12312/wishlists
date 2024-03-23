import {Dayjs} from "dayjs";

export interface IWish {
    description: string;
    name: string;
    uuid: string;
    created_at?: Dayjs;
    date: string;
    visible: number;
    user_id: number;
    wishes_count?: number;
    is_active?: boolean;
}