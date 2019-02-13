import {fromObject} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {Contact} from "~/lib/Contact";
import {compose, available} from "nativescript-email";
import {msgFailed} from "~/lib/ui/messages";
import {openUrl} from "tns-core-modules/utils/utils";
import {Log} from "~/lib/Log";
import {dial, requestCallPermission} from "nativescript-phone";


let closeCallback: Function;

let user: Contact;

export function onShownModally(args) {
    user = <Contact>args.context;
    closeCallback = args.closeCallback;
    const page: Page = <Page>args.object;
    page.bindingContext = fromObject({
        qrcode: user.qrcodeIdentity(),
        alias: user.alias,
        email: user.email,
        phone: user.phone,
        url: user.url
    });
}

export async function tapEmail() {
    try {
        if (await available()) {
            await compose({
                subject: "From Personhood",
                to: [user.email]
            })
        }
    } catch (e) {
        await msgFailed("Couldn't send email")
    }
}

export async function tapPhone() {
    requestCallPermission("Allow calling this number?")
        .then(() =>{
            dial(user.phone, false);
        })
        .catch(()=>{
            dial(user.phone, true);
        })
}

export async function tapUrl() {
    let u = user.url;
    if (!u.startsWith("http")) {
        u = "https://" + u;
    }
    Log.print("opening", u);
    try {
        openUrl(u);
    } catch (e) {
        await msgFailed("Couldn't open " + u);
    }
}

export async function goBack() {
    closeCallback();
}