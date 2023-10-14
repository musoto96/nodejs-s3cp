const { S3Client } = require("@aws-sdk/client-s3");
const { fromIni } = require("@aws-sdk/credential-providers");
require('dotenv').config();

//
// This file is intended to handle environment variables
//   and create objects to be passed to the functions inside
//   actions.js file.
//

const config = {
  credentials: fromIni({profile: 'default'})
};

const srcRegion = process.env.SRCREGION;
const dstRegion = process.env.DSTREGION;
const keyOffset = process.env.KEYOFFSET;
const logPath = process.env.LOGPATH;

const srcInput = {
  Bucket: process.env.SRCBUCKET,
  MaxKeys: Number(process.env.MAXKEYS),
  Prefix: process.env.SRCPREFIX,
  RequestPayer: process.env.REQUESTPAYER,
};

// If there is offset pass it to srcInput
if (keyOffset) srcInput.StartAfter = keyOffset;

const dstInput = {
  Bucket: process.env.DSTBUCKET,
};

const srcS3 = new S3Client({ region: srcRegion, ...config });
const dstS3 = new S3Client({ region: dstRegion, ...config });

module.exports = { srcInput, dstInput, srcS3, dstS3, logPath };
