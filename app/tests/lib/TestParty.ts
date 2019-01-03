import {Log} from "~/lib/Log";
import {ByzCoinRPC} from "~/lib/cothority/byzcoin/ByzCoinRPC";
import {Defaults} from "~/lib/Defaults";
import * as Long from "long";
import {Data, TestData} from "~/lib/Data";
import {User} from "~/lib/User";
import {PopDesc, PopPartyInstance, PopPartyStruct} from "~/lib/cothority/byzcoin/contracts/PopPartyInstance";
import {KeyPair} from "~/lib/KeyPair";

describe("testing basic functionalities", ()=>{
    it ("must correctly save attendees", async () =>{
        let ppi = new PopPartyInstance(null, null, new PopPartyStruct(1, 0, [], null, null, [], Long.fromNumber(0), null, null));
        let att1 = new KeyPair();
        let att2 = new KeyPair();

        await expectAsync(ppi.addAttendee(att1._public)).toBeRejected();
        ppi.popPartyStruct.state = 2;

        expect(ppi.tmpAttendees.length).toBe(0);
        await ppi.addAttendee(att1._public);
        expect(ppi.tmpAttendees.length).toBe(1);
        await ppi.addAttendee(att2._public);
        expect(ppi.tmpAttendees.length).toBe(2);
        await expectAsync(ppi.addAttendee(att1._public)).toBeRejected();
        expect(ppi.tmpAttendees.length).toBe(2);
        await expectAsync(ppi.addAttendee(att2._public)).toBeRejected();
        expect(ppi.tmpAttendees.length).toBe(2);

        await ppi.delAttendee(att1._public);
        expect(ppi.tmpAttendees.length).toBe(1);
        await expectAsync(ppi.delAttendee(att1._public)).toBeRejected();
        expect(ppi.tmpAttendees.length).toBe(1);
        await ppi.delAttendee(att2._public);
        expect(ppi.tmpAttendees.length).toBe(0);
        await expectAsync(ppi.delAttendee(att2._public)).toBeRejected();
        expect(ppi.tmpAttendees.length).toBe(0);

        ppi.popPartyStruct.state = 3;
        await expectAsync(ppi.addAttendee(att1._public)).toBeRejected();
    })
});

describe("setup byzcoin and create party", () => {
    afterEach(() => {
        Log.print("Buffer print that will be overwritten in case of error");
    });

    async function setup(nOrgs: number, nAtts: number): Promise<testData> {
        Log.lvl1("Creating new testdata for org1");
        let admin = await TestData.init(new Data());
        await admin.createAll('admin');

        let orgs: Data[] = [];
        for (let i = 0; i < nOrgs; i++) {
            let org = new Data();
            org.bc = admin.cbc.bc;

            await admin.d.registerUser(org.user, Long.fromNumber(1e6));
            await org.verifyRegistration();
            expect(org.user.isRegistered()).toBeTruthy();
            orgs.push(org);
        }

        let atts: Data[] = [];
        for (let i = 0; i < nAtts; i++) {
            let att = new Data();
            att.bc = admin.cbc.bc;
            atts.push(att)
        }
        return new testData(admin, orgs, atts);
    }

    fit("Creates new party", async () => {
        let td = await setup(1, 2);
        let pdesc = new PopDesc("test", "testing", Long.fromNumber(0), "here");

        let partyInst = await td.admin.cbc.spawner.createPopParty(td.admin.d.coinInstance, [td.admin.d.keyIdentitySigner], [td.orgs[0].keyIdentity._public], pdesc, Long.fromNumber(1000));
        Log.lvl1("finished creating byzcoin, organizer and attendee");

        // Cannot get final statement yet.
        await expectAsync(partyInst.getFinalStatement()).toBeRejected();

        Log.lvl1("setting barrier");
        await partyInst.setBarrier(td.orgs[0].keyIdentitySigner);

        Log.lvl1("Adding attendee");
        await partyInst.addAttendee(td.atts[0].keyPersonhood._public);
        expect(partyInst.tmpAttendees.length).toBe(1);

        // Finalizing party
        Log.lvl1("Finalize party");
        await partyInst.finalize(td.orgs[0].keyIdentitySigner);
        expect(partyInst.popPartyStruct.state).toBe(3);

        // Cannot set barrier anymore
        Log.lvl1("Resetting barrier");
        await expectAsync(partyInst.setBarrier(td.orgs[0].keyIdentitySigner)).toBeRejected();

        let fs = await partyInst.getFinalStatement();
        expect(fs.attendees.keys.length).toBe(1);

        await partyInst.mineFromData(td.atts[0]);
        expect(td.atts[0].coinInstance.coin.value.toNumber()).toBe(1000);

        Log.lvl1("expect unknown attendee to be rejected");
        partyInst.popPartyStruct.attendees.keys = [td.atts[0].keyPersonhood._public, td.atts[1].keyPersonhood._public];
        await expectAsync(partyInst.mineFromData(td.atts[1])).toBeRejected();
        Log.lvl1("expecting double-mining to be rejected");
        partyInst.popPartyStruct.attendees.keys = [td.atts[0].keyPersonhood._public];
        await expectAsync(partyInst.mineFromData(td.atts[0])).toBeRejected();
    });

    it("Creates new party with two organizers", async () => {

    })
});

class testData {
    constructor(public admin: TestData, public orgs: Data[], public atts: Data[]) {
    }
}
