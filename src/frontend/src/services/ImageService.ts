import $api from "../http";
import {AxiosResponse} from "axios";
import {IUser} from "../models/IUser";

export default class ImageService {
    //TODO: Доработать подключения сервиса загрузки изображений
    static uploadImage(formData: FormData): Promise<AxiosResponse<any>> {
        return $api.post<any>('/api/images/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
    }
}

