const { 
  S3Client, 
  CopyObjectCommand, 
  ListObjectsV2Command, 
  ListObjectVersionsCommand 
} = require("@aws-sdk/client-s3");
const { fromIni } = require("@aws-sdk/credential-providers");

const sourceConfig = {
  region: "eu-west-1",
  credentials: fromIni({profile: 'default'})
};
const destConfig = {
  region: "us-east-2",
  credentials: fromIni({profile: 'default'})
};

const sourceInput = {
  Bucket: 'public.bitmex.com',
  MaxKeys: 1001,
  Prefix: 'data/trade/',
  RequestPayer: "requester",
};

const s3Source = new S3Client(sourceConfig);
const s3Dest = new S3Client(destConfig);

const listObjectsV2 = new ListObjectsV2Command(sourceInput);

async function listAll() {
  try {
    console.log('Fetching object list');
    const objects = await s3Source.send(listObjectsV2);
  } catch (error) {
    console.error('Error:', error);
  }
}
//listAll();

async function copyObjectsWithDelay() {
  try {
    // List objects in the source bucket
    const objects = await s3Source.send(listObjectsV2);;
    console.log('Object list fetched');

    // Iterate through objects
    for (const obj of objects.Contents || []) {
      const sourceKey = obj.Key;

      if (sourceKey !== sourceInput.Prefix) {

        const destInput = {
          Bucket: 'public.bitmex.com-mirror',
          Key: sourceKey,
          CopySource: `${sourceInput.Bucket}/${sourceKey}`,
        };
        const copyObject = new CopyObjectCommand(destInput);

        await s3Dest.send(copyObject);
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

copyObjectsWithDelay();
