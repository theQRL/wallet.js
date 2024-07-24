export class Dilithium {
    constructor(seed?: any);
    pk: Uint8Array;
    sk: Uint8Array;
    seed: any;
    randomizedSigning: boolean;
    create(): void;
    fromSeed(): void;
    getPK(): Uint8Array;
    getSK(): Uint8Array;
    getSeed(): any;
    getHexSeed(): string;
    getMnemonic(): string;
    getAddress(): Uint8Array;
    seal(message: any): any;
    sign(message: any): Uint8Array;
}
export function getDilithiumAddressFromPK(pk: any): Uint8Array;
export function getDilithiumDescriptor(address: any): number;
export function openMessage(signatureMessage: any, pk: any): any;
export function verifyMessage(message: any, signature: any, pk: any): any;
export function extractMessage(signatureMessage: any): any;
export function extractSignature(signatureMessage: any): any;
export function isValidDilithiumAddress(address: any): boolean;
//# sourceMappingURL=dilithium.d.ts.map