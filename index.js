const { listAll, copyObjectsWithDelay } = require("./actions.js");
const { srcInput, dstInput, srcS3, dstS3, logPath } = require("./settings.js");

//
// This function will iterate on a source bucket untill all items
//   are copied to the destination bucket.
// 
//   See .env to manually specify an offset using KEYOFFSET.
//   The maximum items in per page are 1000, see the  MAXKEYS to change 
//     page size.
//
async function mirror() {
  try {
    // Stay in loop while there are items to be fetched.
    while (true) {
      const objects = await listAll(srcS3, srcInput, logPath);
      await copyObjectsWithDelay(objects, dstS3, dstInput, logPath);

      // If the there more keys to be fetched
      //   use the last key of the last object fetched as starting point,
      //   see .env KEYOFFSET to manually specify an offset.
      if (objects.IsTruncated) {
        srcInput.StartAfter = objects.Contents.slice(-1)[0].Key;
      } else {
      // No more keys to be fetched, iterations done.
        break;
      }
    }
  } catch (error) {
    console.error('Mirror error:', error);
  }
}
mirror();
