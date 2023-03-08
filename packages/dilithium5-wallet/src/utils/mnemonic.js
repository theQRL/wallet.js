import WordList from "../qrl";

export function SeedBinToMnemonic(input) {
    return binToMnemonic(input);
}

function binToMnemonic(input) {
    if (String(input).length % 3 != 0) {
        console.error("byte count needs to be a multiple of 3");
    }
    var separator = "";
    let buf = Buffer.alloc(input.length * 4);
    for (let nibble = 0; nibble < input.length * 2; nibble += 3) {
        let p = nibble >> 1;
        let b1 = input[p];
        let b2 = 0;
        if ((p + 1) < input.length) {
            b2 = input[p + 1]
        }
        let idx = 0;
        if (nibble % 2 == 0) {
            idx = (b1 << 4) + (b2 >> 4);
        } else {
            idx = ((b1 & 0x0F) << 8) + b2;
        }
        buf.fill(separator, WordList[idx]);
        separator = " ";
    }
    return buf.toString()
}