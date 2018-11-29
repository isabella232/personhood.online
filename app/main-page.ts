/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { HelloWorldModel } from "./main-view-model";
import { Frame, topmost } from "tns-core-modules/ui/frame";
import {Data} from "~/lib/Data";
import * as application from "tns-core-modules/application";

// Event handler for Page "navigatingTo" event attached in main-page.xml
export function navigatingTo(args: EventData) {
    let d = new Data();

    if (d.alias == ""){
        return topmost().navigate("pages/setup/1-present");
    }
}
