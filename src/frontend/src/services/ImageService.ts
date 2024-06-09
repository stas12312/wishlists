import $api from "../http";
import {AxiosResponse} from "axios";
import {IUser} from "../models/IUser";

export default class ImageService {
    //TODO: Доработать подключения сервиса загрузки изображений
    static uploadImage(): Promise<AxiosResponse<IUser>> {
        return $api.post<IUser>('/api/images/uploade', {})
    }
}

