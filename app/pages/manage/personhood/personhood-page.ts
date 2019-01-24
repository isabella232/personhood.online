/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

import {EventData, fromObject} from "tns-core-modules/data/observable";
import {gData} from "~/lib/Data";
import {Page} from "tns-core-modules/ui/page";
import {Log} from "~/lib/Log";
import * as dialogs from "tns-core-modules/ui/dialogs";
import {GestureEventData} from "tns-core-modules/ui/gestures";
import {Contact} from "~/lib/Contact";
import * as Long from "long";
import {scanNewUser} from "~/lib/ui/users";
import {ObservableArray} from "tns-core-modules/data/observable-array";
import {PersonhoodView} from "~/pages/manage/personhood/personhood-view";
import {msgOK} from "~/lib/ui/messages";
import {topmost} from "tns-core-modules/ui/frame";

export let elements: PersonhoodView;
let page: Page;

// Event handler for Page "navigatingTo" event attached in identity.xml
export async function navigatingTo(args: EventData) {
    page = <Page>args.object;
    elements = new PersonhoodView();
    page.bindingContext = elements;
    await elements.updateAddParty();
    await elements.updateParties();
    await elements.updateBadges();
    setTimeout(()=>updateParties(), 1);
}

export async function updateParties() {
    try {
        await elements.updateAddParty();
        await gData.reloadParties();
        await gData.save();
        await elements.updateParties();
        await elements.updateBadges();
    } catch(e){
        Log.catch(e);
    }
}

export async function addParty(args: GestureEventData) {
    return topmost().navigate({
        moduleName: "pages/manage/personhood/add-party/add-party-page",
    });
}
