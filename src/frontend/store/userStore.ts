import { IUser } from "@/lib/models"
import { getMe } from "@/lib/requests"
import { makeAutoObservable, flow } from "mobx"

class UserStore {
    user: IUser = {id: 0, name: "", email: ""}

    constructor() {
        makeAutoObservable(this)
    }

    fetchMe = flow(function* (this: UserStore) {
        if (!this.user.id) {
            this.user = yield getMe()
        }
    })
}


const userStore = new UserStore();
export default userStore;