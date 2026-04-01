import MinioClientManager from "#src/utils/MinioManager.ts"

class OssManager{

    minioManager = new MinioClientManager();

    constructor(){

        // 添加 MinIO 实例
        this.minioManager.addClient({
            instanceName: 'primary',
            endPoint: 'pallas.local',
            port: 9000,
            useSSL: false,
            accessKey: '6d9ekS4CDj05D8OUwCPD',
            secretKey: 'R22IxxjVwrL3mh9wrjC0Yn2yXvroOwYHroQDSNeX'
        });
    }

    async uploadFile(objectName, data){
        // 1. 从 Buffer 上传
        const etag1 = await this.minioManager.uploadFile({
            bucketName: 'public',
            objectName: objectName,
            buffer: Buffer.from(data),
            contentType: 'text/plain'
        }, 'primary');
        console.log('Buffer upload ETag:', etag1);
    }


    async uploadFromString(objectName, data){
        // 2. 从字符串上传
        const etag2 = await this.minioManager.uploadFromString(
            'public',
            objectName,
            data,
            'text/plain',
            { 'source': 'string' },
            'primary'
        );
        console.log('String upload ETag:', etag2);
    }

    async uploadFromFile(objectName, filePath){
        // 3. 从文件上传
        const etag = await this.minioManager.uploadFromFile(
            'public',
            objectName,
            filePath,
            {
            'source': 'local-file',
            'upload-time': new Date().toISOString()
            },
            'primary'
        );
        console.log('本地文件上传成功，ETag:', etag);
    }

  
      // 4. 从 Node.js Readable 流上传
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
  
      // 5. 下载文件
      // const fileData = await minioManager.downloadFile({
      //   bucketName: 'public',
      //   objectName: 'test/buffer-example.txt'
      // }, 'primary');
      // console.log('Downloaded content:', fileData.toString());
  
      // 6. 获取文件流
      // const fileStream = await minioManager.getFileStream('public', 'test/buffer-example.txt', 'primary');
      // console.log('File stream obtained');
  
      // 7. 批量删除
    //   const deleteResult = await minioManager.removeObjectsOneByOne(
    //     'public',
    //     ['buffer-example.txt', 'string-example.txt', 'stream-example.txt'],
    //     'primary'
    //   );
    //   console.log('Delete result:', deleteResult);

    destroy(){
        this.minioManager.destroy();
    }

}
export const oss = new OssManager();
