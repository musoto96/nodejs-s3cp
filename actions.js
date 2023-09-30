const { 
  CopyObjectCommand, 
  ListObjectsV2Command, 
} = require("@aws-sdk/client-s3");

async function listAll(client, input) {
  try {
    console.log('Fetching object list');
    const objects = await client.send(new ListObjectsV2Command(input));
    return objects;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function copyObjectsWithDelay(objects, dstClient, dstInput) {
  try {
    console.log(`Objects fetched: ${objects.Contents.length}`);

    // Iterate through objects
    for (const obj of objects.Contents || []) {
      const srcKey = obj.Key;

      if (srcKey !== objects.Prefix) {

        dstInput.Key = srcKey;
        dstInput.CopySource = `${objects.Name}/${srcKey}`;

        const copyObject = new CopyObjectCommand(dstInput);

        await dstClient.send(copyObject);
        console.log(`Object ${obj.Key} copied`);

        // Wait n seconds
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    console.log('Objects copied successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = { listAll, copyObjectsWithDelay };
