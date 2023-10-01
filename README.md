# S3cp

### Description
The script will copy an entire bucket contents to another bucket. 
&nbsp;

If you want to use the `Dockerfile` copy your .aws to the repository directory or the build 
command will fail.

&nbsp;

### Prerequisites
1. NodeJs Installed (or Docker)
2. Have your AWS credentials (key and secret) on your home directory `~/.aws/credentials`. For more info visit [AWS Shared Credentials file location](https://docs.aws.amazon.com/sdkref/latest/guide/file-location.html)

&nbsp;

### Getting started.
Install packages
```
npm install
```

&nbsp;

Update `.env` according to your needs.

The entrypoint is on `index.js`
```
node index.js
```
