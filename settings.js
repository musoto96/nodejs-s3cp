const { S3Client } = require("@aws-sdk/client-s3");
const { fromIni } = require("@aws-sdk/credential-providers");
require('dotenv').config();

const config = {
  credentials: fromIni({profile: 'default'})
};

const srcRegion = process.env.SRCREGION;
const dstRegion = process.env.DSTREGION;

const srcInput = {
  Bucket: process.env.SRCBUCKET,
  MaxKeys: Number(process.env.MAXKEYS),
  Prefix: process.env.SRCPREFIX,
  RequestPayer: process.env.REQUESTPAYER,
};

const dstInput = {
  Bucket: process.env.DSTBUCKET,
};

const srcS3 = new S3Client({ region: srcRegion, ...config });
const dstS3 = new S3Client({ region: dstRegion, ...config });

module.exports = { srcInput, dstInput, srcS3, dstS3 };
