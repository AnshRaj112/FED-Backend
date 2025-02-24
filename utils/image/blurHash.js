const fs = require('fs');
const { encode } = require('blurhash');

const encodeImageToBlurhash = async (file)=>{
    const buffer = await fs.promises.readFile(file);
    const blurString = encode(new Uint8ClampedArray(buffer), 32, 32);
    if (process.env.DEBUG === "true") {
        console.log(blurString)
    }
    return blurString;
}

module.exports = encodeImageToBlurhash;