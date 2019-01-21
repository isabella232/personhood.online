import {Log} from "~/lib/Log";
import {GestureEventData} from "tns-core-modules/ui/gestures";
import {Frame, getFrameById, topmost} from "tns-core-modules/ui/frame";
import {SelectedIndexChangedEventData} from "tns-core-modules/ui/tab-view";
import {msgFailed} from "~/lib/ui/messages";

export let frame: Frame;

export function goRoPaSci(args: GestureEventData) {
    frame = args.view.page.frame;
    return frame.navigate({
        moduleName: "pages/lab/ropasci/ropasci-page",
    })
}

export function goPoll(args: GestureEventData) {
    return msgFailed("Troll resistant polling is not yet available");
    frame = args.view.page.frame;
    return frame.navigate({
        moduleName: "pages/lab/ropasci/ropasci-page",
    })
}

export async function switchLab(args: SelectedIndexChangedEventData) {
    try {
        if (frame) {
            let ret = await frame.navigate("pages/lab/lab-page");
            frame = null;
            return ret;
        }
    } catch (e) {
        Log.catch(e);
    }
}

