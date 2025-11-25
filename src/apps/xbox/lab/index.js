import MinioClientManager from "#src/utils/MinioManager.ts"
// import { Readable, Writable } from 'stream';


export function labMain(){
    // console.log("hello xxx")
    example().catch(console.error);
}


async function example() {
    const minioManager = new MinioClientManager();
  
    // 添加 MinIO 实例
    minioManager.addClient({
      instanceName: 'primary',
      endPoint: 'pallas.local',
      port: 9000,
      useSSL: false,
      accessKey: '6d9ekS4CDj05D8OUwCPD',
      secretKey: 'R22IxxjVwrL3mh9wrjC0Yn2yXvroOwYHroQDSNeX'
    });
  
    try {
      // 1. 从 Buffer 上传
      const etag1 = await minioManager.uploadFile({
        bucketName: 'public',
        objectName: 'test/buffer-example.txt',
        buffer: Buffer.from('Hello from Buffer!'),
        contentType: 'text/plain'
      }, 'primary');
      console.log('Buffer upload ETag:', etag1);
  
      // 2. 从字符串上传
      const etag2 = await minioManager.uploadFromString(
        'public',
        'test/string-example.txt',
        'Hello from string!',
        'text/plain',
        { 'source': 'string' },
        'primary'
      );
      console.log('String upload ETag:', etag2);
  
    //   // 3. 从 Node.js Readable 流上传
    //   const nodeStream = minioManager.createReadableStreamFromString('Hello from Node.js stream!');
    //   const etag3 = await minioManager.uploadFromStream(
    //     'public',
    //     'stream-example.txt',
    //     nodeStream,
    //     undefined, // size
    //     'text/plain',
    //     { 'source': 'stream' },
    //     'primary'
    //   );
    //   console.log('Stream upload ETag:', etag3);
  
      // 4. 下载文件
      const fileData = await minioManager.downloadFile({
        bucketName: 'public',
        objectName: 'test/buffer-example.txt'
      }, 'primary');
      console.log('Downloaded content:', fileData.toString());
  
      // 5. 获取文件流
      const fileStream = await minioManager.getFileStream('public', 'test/buffer-example.txt', 'primary');
      console.log('File stream obtained');
  
    //   // 6. 批量删除
    //   const deleteResult = await minioManager.removeObjectsOneByOne(
    //     'public',
    //     ['buffer-example.txt', 'string-example.txt', 'stream-example.txt'],
    //     'primary'
    //   );
    //   console.log('Delete result:', deleteResult);
  
    } catch (error) {
      console.error('Error:', error);
    } finally {
      minioManager.destroy();
    }
  }