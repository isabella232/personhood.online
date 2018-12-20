import {Observable} from "tns-core-modules/data/observable";
import {User} from "~/lib/User";
import {Log} from "~/lib/Log";
import {gData} from "~/lib/Data";
import {friendsUpdateList, setProgress} from "~/pages/manage/friends/friends-page";
import {topmost} from "tns-core-modules/ui/frame";
import {ItemEventData} from "tns-core-modules/ui/list-view";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as Long from "long";
import {assertRegistered, sendCoins} from "~/lib/ui/users";
import {msgFailed, msgOK} from "~/lib/ui/messages";

export class FriendsView extends Observable {
    private _users: UserView[];
    private _networkStatus: string;

    constructor(users: User[]) {
        super();

        // Initialize default values.
        this.updateUsers(users);
    }

    updateUsers(users: User[]) {
        this._users = users.map(u => new UserView(u));
        this.notifyPropertyChange("users", this._users);
    }

    public set networkStatus(str: string){
        this._networkStatus = str;
        this.notifyPropertyChange("networkStatus", this._networkStatus);
    }

    public get networkStatus():string{
        return this._networkStatus;
    }
}

export class UserView extends Observable {
    private _user: User;

    constructor(user: User) {
        super();

        this._user = user;
    }

    set user(user: User) {
        this._user = user;
    }

    get alias(): string{
        return this._user.alias;
    }

    public async deleteUser(arg: ItemEventData) {
        if (await dialogs.confirm({
            title: "Remove user",
            message: "Are you sure to remove user " + this._user.alias + " from your list?",
            okButtonText: "Remove",
            cancelButtonText: "Keep",
        })) {
            gData.rmUser(this._user);
            await gData.save();
            friendsUpdateList();
        }
    }

    public async showUser(arg: ItemEventData){
        topmost().showModal("pages/modal/modal-user", this._user,
            ()=>{}, false, false, false);
    }

    public async payUser(args: ItemEventData) {
        try {
            await sendCoins(this._user, setProgress);
        } catch(e){
            Log.catch(e);
            await msgFailed(e, "Error");
        }
        setProgress();
    }

    public async credUser(arg: ItemEventData){
        await dialogs.confirm({
            title: "Credentials of " + this._user.alias,
            message: this._user.credential.credentials.map(
                (c) => {
                    return c.name + ": " + c.attributes[0].name;
                }).join("\n"),
            okButtonText: "OK",
        })
    }
}
