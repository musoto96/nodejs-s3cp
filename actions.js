const fs = require('fs/promises');
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
async function listAll(client, input, logPath, retryWait=5000) {
  //
  // This block checks if an offset was passed to srcInput
  //   if it was it will be used, if not, local database will be 
  //   checked, if its not empty, it will use the last key as offset.
  //
  if (!input.StartAfter) {
    const db = await readJson(logPath);
    if (db.Saved && db.Saved.length > 0) {
      try {
        const lastKey = db.Saved.slice(-1)[0];
        input.StartAfter = lastKey.Key;
        console.log(`Using local metadata offset: ${input.StartAfter}`);
      } catch (err) {
        console.log(`Error parsing offset on: ${logPath}\n`, err);
      }
    } else {
      console.log('No offset defined, starting from scratch');
    }
  } else {
    console.log(`Using .env offset: ${input.StartAfter}`);
  }

  let objects;
  while (!objects) {
    try {
      console.log('Fetching object list');
      objects = await client.send(new ListObjectsV2Command(input));
      console.log(`Objects fetched: ${objects.Contents.length}`);
      return objects;
    } catch (error) {
      console.error('Error fetching:', error);
      console.error(`Rerying in ${retryWait / 1000}s`);
      await new Promise((resolve) => setTimeout(resolve, retryWait));
    }
  }
}

// 
// Copies the supplied objects to a destination bucket
//   See .env variables:
//     DSTBUCKET  -  Destination bucket
//     DSTREGION  -  Destination bucket region
// 
async function copyObjectsWithDelay(objects, dstClient, dstInput, logPath, copyWait=1000) {
  console.log(`Objects passed for copy: ${objects.Contents.length}`);

  //
  // This block will iterate through objects, copying them 
  //   to destination bucket and saving metadata to 
  //   local database file. 
  //
  for (const obj of objects.Contents || []) {
    if (obj.Key !== objects.Prefix) {
      Object.assign(dstInput, {
        Key: obj.Key,
        CopySource: `${objects.Name}/${obj.Key}`,
      });

      const copyObject = new CopyObjectCommand(dstInput);

      // Loop until copy is successful
      let status;
      while (status !== 200) {
        try {
        // Wait n seconds
        await new Promise((resolve) => setTimeout(resolve, copyWait));

        // Attempt to copy
        const copyResult = await dstClient.send(copyObject);
        status = copyResult['$metadata'].httpStatusCode;
 
        if (status === 200) {
          console.log(`Object ${obj.Key} copied, status: ${status}`);
          const db = await readJson(logPath);
          if (db.Saved) {
            db.Saved.push(obj);
          } else {
            db.Saved = [obj];
          }
          writeJson(JSON.stringify(db, null, 2), logPath);
        }

        } catch (err) {
          console.error('Error copying:', error);
        }
      }
    }
  }
  console.log('Objects copied successfully');
}

//
// Reads json file and returns the contents
//   if the file is empty, returns an emtpy object.
//
async function readJson(path) {
  // If the file exists, read it
  try {
    const handle = await fs.open(path, 'r+');
    const data = await handle.readFile('utf-8');

    // Check if file is empty
    //   and try to parse the data into json
    //   if no data in file return empty object
    if (data) {
      try {
        const jsonData = JSON.parse(data);
        handle.close();
        return jsonData;
      } catch (err) {
        console.error("Error parsing file:\n", err);
      }
    } else {
      console.log('Empty file');
      handle.close();
      return {};
    }

  // If file does not exist, create it
  //   and return empty object
  } catch (err) {
    if (err.code == 'ENOENT') {
      console.log(`File ${err.path} does not exist, creating...`);

      const handle = await fs.open(path, 'w+');
      handle.close();
      return {};
    } else {
      throw err;
    }
  }
}

//
// Opens file writes to it and closes it
//   nothing fancy.
//
async function writeJson(data, path) {
  try {
    const handle = await fs.open(path, 'r+');
    await handle.writeFile(data, 'utf-8');
    console.log(`File written: ${path}`);
    handle.close();
  } catch (err) {
    console.log('Write error:\n', err);
  }
}

module.exports = { listAll, copyObjectsWithDelay };
