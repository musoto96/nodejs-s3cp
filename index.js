const { fromIni } = require("@aws-sdk/credential-providers");
const { listAll, copyObjectsWithDelay } = require("./actions.js");
const { srcInput, dstInput, srcS3, dstS3 } = require("./settings.js");

async function mirror() {
  try {
    const trades = await listAll(srcS3, srcInput);
    await copyObjectsWithDelay(trades, dstS3, dstInput);
  } catch (error) {
    console.error('Mirror error:', error);
  }
}
mirror();
