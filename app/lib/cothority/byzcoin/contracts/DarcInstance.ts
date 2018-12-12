import {ByzCoinRPC} from "~/lib/cothority/byzcoin/ByzCoinRPC";
import {Darc} from "~/lib/cothority/darc/Darc";
import {Argument, ClientTransaction, InstanceID, Instruction} from "~/lib/cothority/byzcoin/ClientTransaction";
import {Proof} from "~/lib/cothority/byzcoin/Proof";
import {Signer} from "~/lib/cothority/darc/Signer";

export class DarcInstance {
    static readonly contractID = "darc";

    constructor(public bc: ByzCoinRPC, public iid: InstanceID, public darc: Darc) {
    }

    /**
     * Update the data of this instance
     *
     * @return {Promise<DarcInstance>} - a promise that resolves once the data
     * is up-to-date
     */
    async update(): Promise<DarcInstance> {
        let proof = await this.bc.getProof(new InstanceID(this.darc.getBaseId()));
        this.darc = DarcInstance.darcFromProof(proof);
        return this;
    }

    static async create(bc: ByzCoinRPC, iid: InstanceID, signers: Signer[], d: Darc): Promise<DarcInstance> {
        let inst = Instruction.createSpawn(iid,
            this.contractID,
            [new Argument("darc", d.toProto())]);
        let ctx = new ClientTransaction([inst]);
        await ctx.signBy([signers], bc);
        await bc.sendTransactionAndWait(ctx, 5);
        return new DarcInstance(bc, new InstanceID(d.getBaseId()), d);
    }

    static fromProof(bc: ByzCoinRPC, p: Proof): DarcInstance {
        p.matchOrFail(DarcInstance.contractID);
        return new DarcInstance(bc, p.requestedIID, DarcInstance.darcFromProof(p));
    }

    /**
     * Initializes using an existing coinInstance from ByzCoin
     * @param bc
     * @param instID
     */
    static async fromByzcoin(bc: ByzCoinRPC, iid: InstanceID): Promise<DarcInstance> {
        return DarcInstance.fromProof(bc, await bc.getProof(iid));
    }

    static darcFromProof(p: Proof): Darc{
        if (p.contractID != DarcInstance.contractID) {
            throw new Error("Got non-darc proof: " + p.contractID);
        }
        return Darc.fromProto(p.value);
    }
}
