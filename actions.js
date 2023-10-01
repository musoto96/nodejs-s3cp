const { 
  CopyObjectCommand, 
  ListObjectsV2Command, 
} = require("@aws-sdk/client-s3");

// 
// Returns a list of objects from an input S3 bucket.
//   See .env variables:
//     SRCBUCKET  -  Source bucket
//     SRCREGION  -  Source bucket region
//     SRCPREFIX  -  Source bucket prefix e.g. photos/cats
// 
async function listAll(client, input) {
  try {
    console.log('Fetching object list');
    const objects = await client.send(new ListObjectsV2Command(input));
    return objects;
  } catch (error) {
    console.error('Error:', error);
  }
}

// 
// Copies the supplied objects to a destination bucket
//   See .env variables:
//     DSTBUCKET  -  Destination bucket
//     DSTREGION  -  Destination bucket region
// 
async function copyObjectsWithDelay(objects, dstClient, dstInput) {
  try {
    console.log(`Objects fetched: ${objects.Contents.length}`);

    // Iterate through objects
    for (const obj of objects.Contents || []) {

      if (obj.Key !== objects.Prefix) {

        //dstInput.Key = obj.Key;
        //dstInput.CopySource = `${objects.Name}/${obj.Key}`;
        //dstInput.CopySourceIfNoneMatch = obj.ETag;

        Object.assign(dstInput, {
          Key: obj.Key,
          CopySource: `${objects.Name}/${obj.Key}`,
          CopySourceIfNoneMatch: obj.ETag,
        });

        const copyObject = new CopyObjectCommand(dstInput);
        try {
          const copyResult = await dstClient.send(copyObject);
          console.log(`Object ${obj.Key} copied`);
          console.log(copyResult);

          // Wait n seconds
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (PreconditionFailed) {
          console.log(`Object ${obj.Key} already exists, skipping.`);
        }

      }
    }
    console.log('Objects copied successfully');
  } catch (error) {
    console.error('Copy error:', error);
  }
}

module.exports = { listAll, copyObjectsWithDelay };
