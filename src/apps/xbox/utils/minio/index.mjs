import * as Minio from 'minio'

// Instantiate the MinIO client with the object store service
// endpoint and an authorized user's credentials
// play.min.io is the MinIO public test cluster
const minioClient = new Minio.Client({
  endPoint: '192.168.0.121',
  port: 9000,
  useSSL: false,
  accessKey: 'D4zVKkZe1sVfeV5xGYJG',
  secretKey: 'IJtCxaWDAAuhJbNUdGTimZsK1N28LIUP04WoGFu3',
})

// File to upload
const sourceFile = 'D:\\Resources\\文件\\test.txt'

// Destination bucket
const bucket = 'public'

// Destination object name
const destinationObject = 'files/test.txt'

// Check if the bucket exists
// If it doesn't, create it
const exists = await minioClient.bucketExists(bucket)
if (exists) {
  console.log('Bucket ' + bucket + ' exists.')
} else {
  await minioClient.makeBucket(bucket, 'us-east-1')
  console.log('Bucket ' + bucket + ' created in "us-east-1".')
}

// Set the object metadata
var metaData = {
  'Content-Type': 'text/plain',
  // 'X-Amz-Meta-Testing': 1234,
  //  amzRequestid:0,
  //   amzId2:0,
  //    amzBucketRegion:0,
  // example: 5678,
}

// Upload the file with fPutObject
// If an object with the same name exists,
// it is updated with new data
await minioClient.fPutObject(bucket, destinationObject, sourceFile, metaData)
console.log('File ' + sourceFile + ' uploaded as object ' + destinationObject + ' in bucket ' + bucket)