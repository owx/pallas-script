import * as Minio from 'minio';
import { EventEmitter } from 'events';
import { Readable } from 'stream';

// MinIO 客户端配置接口
export interface MinioClientConfig {
  endPoint: string;
  port?: number;
  useSSL?: boolean;
  accessKey: string;
  secretKey: string;
  region?: string;
  instanceName?: string;
}

// 文件上传选项 - 只使用 Node.js 原生类型
export interface UploadOptions {
  bucketName: string;
  objectName: string;
  filePath?: string;
  stream?: Readable; // 使用 Node.js 的 Readable，不是 ReadableStream
  buffer?: Buffer;
  metaData?: Record<string, string | number>;
  contentType?: string;
  size?: number;
}

// 文件下载选项
export interface DownloadOptions {
  bucketName: string;
  objectName: string;
  filePath?: string;
  stream?: NodeJS.WritableStream;
}

// 上传结果接口
export interface UploadResult {
  etag: string;
  bucketName: string;
  objectName: string;
  instanceName: string;
  size?: number;
}

// 删除结果接口
export interface RemoveObjectsResult {
  success: boolean;
  deleted: string[];
  errors: Array<{ objectName: string; error: Error }>;
}

// MinIO 客户端管理类
export class MinioClientManager extends EventEmitter {
  private clients: Map<string, Minio.Client> = new Map();
  private defaultInstance: string = 'default';

  constructor() {
    super();
  }

  /**
   * 添加 MinIO 客户端实例
   */
  addClient(config: MinioClientConfig): void {
    const instanceName = config.instanceName || this.defaultInstance;
    
    const client = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port || (config.useSSL ? 443 : 9000),
      useSSL: config.useSSL || false,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      region: config.region || 'us-east-1'
    });

    this.clients.set(instanceName, client);
    this.emit('clientAdded', instanceName, config);
  }

  /**
   * 获取客户端实例
   */
  getClient(instanceName: string = this.defaultInstance): Minio.Client {
    const client = this.clients.get(instanceName);
    if (!client) {
      throw new Error(`MinIO client instance '${instanceName}' not found`);
    }
    return client;
  }

  /**
   * 移除客户端实例
   */
  removeClient(instanceName: string): boolean {
    const result = this.clients.delete(instanceName);
    if (result) {
      this.emit('clientRemoved', instanceName);
    }
    return result;
  }

  /**
   * 获取所有客户端实例名称
   */
  getAllInstanceNames(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * 检查桶是否存在
   */
  async bucketExists(bucketName: string, instanceName?: string): Promise<boolean> {
    const client = this.getClient(instanceName);
    return await client.bucketExists(bucketName);
  }

  /**
   * 创建桶
   */
  async makeBucket(bucketName: string, region?: string, instanceName?: string): Promise<void> {
    const client = this.getClient(instanceName);
    await client.makeBucket(bucketName, region);
    this.emit('bucketCreated', bucketName, instanceName);
  }

  /**
   * 列出所有桶
   */
  async listBuckets(instanceName?: string): Promise<Minio.BucketItemFromList[]> {
    const client = this.getClient(instanceName);
    return await client.listBuckets();
  }

  /**
   * 删除桶
   */
  async removeBucket(bucketName: string, instanceName?: string): Promise<void> {
    const client = this.getClient(instanceName);
    await client.removeBucket(bucketName);
    this.emit('bucketRemoved', bucketName, instanceName);
  }

  /**
   * 上传文件 - 只接受 Node.js 原生类型
   */
  async uploadFile(options: UploadOptions, instanceName?: string): Promise<string> {
    const client = this.getClient(instanceName);
    const { bucketName, objectName, filePath, stream, buffer, metaData, contentType, size } = options;

    // 确保桶存在
    const bucketExists = await this.bucketExists(bucketName, instanceName);
    if (!bucketExists) {
      await this.makeBucket(bucketName, undefined, instanceName);
    }

    try {
      let result: any;

      if (filePath) {
        // 从文件路径上传
        await client.fPutObject(bucketName, objectName, filePath, metaData);
        result = 'file_uploaded';
      } else if (stream) {
        // 从 Node.js Readable 流上传
        const finalMetaData: Record<string, any> = {
          ...metaData
        };
        
        if (contentType) {
          finalMetaData['Content-Type'] = contentType;
        }
        
        result = await client.putObject(
          bucketName, 
          objectName, 
          stream, 
          size, 
          Object.keys(finalMetaData).length > 0 ? finalMetaData : undefined
        );
      } else if (buffer) {
        // 从缓冲区上传
        const finalMetaData: Record<string, any> = {
          ...metaData
        };
        
        if (contentType) {
          finalMetaData['Content-Type'] = contentType;
        }
        
        result = await client.putObject(
          bucketName, 
          objectName, 
          buffer, 
          buffer.length, 
          Object.keys(finalMetaData).length > 0 ? finalMetaData : undefined
        );
      } else {
        throw new Error('Must provide filePath, stream, or buffer for upload');
      }

      const etag = typeof result === 'string' ? result : 'upload_success';
      this.emit('fileUploaded', bucketName, objectName, etag, instanceName);
      return etag;

    } catch (error) {
      this.emit('uploadError', error, bucketName, objectName, instanceName);
      throw error;
    }
  }

  /**
   * 从字符串上传文件
   */
  async uploadFromString(
    bucketName: string,
    objectName: string,
    content: string,
    contentType?: string,
    metaData?: Record<string, string | number>,
    instanceName?: string
  ): Promise<string> {
    const buffer = Buffer.from(content, 'utf-8');
    return this.uploadFile({
      bucketName,
      objectName,
      buffer,
      contentType: contentType || 'text/plain',
      size: buffer.length,
      metaData
    }, instanceName);
  }

  /**
   * 从 Uint8Array 上传文件
   */
  async uploadFromUint8Array(
    bucketName: string,
    objectName: string,
    data: Uint8Array,
    contentType?: string,
    metaData?: Record<string, string | number>,
    instanceName?: string
  ): Promise<string> {
    const buffer = Buffer.from(data);
    return this.uploadFile({
      bucketName,
      objectName,
      buffer,
      contentType: contentType || 'application/octet-stream',
      size: buffer.length,
      metaData
    }, instanceName);
  }

  /**
   * 从文件路径上传文件
   */
  async uploadFromFile(
    bucketName: string,
    objectName: string,
    filePath: string,
    metaData?: Record<string, string | number>,
    instanceName?: string
  ): Promise<string> {
    return this.uploadFile({
      bucketName,
      objectName,
      filePath,
      metaData
    }, instanceName);
  }

  /**
   * 从 Node.js Readable 流上传文件
   */
  async uploadFromStream(
    bucketName: string,
    objectName: string,
    stream: Readable,
    size?: number,
    contentType?: string,
    metaData?: Record<string, string | number>,
    instanceName?: string
  ): Promise<string> {
    return this.uploadFile({
      bucketName,
      objectName,
      stream,
      size,
      contentType,
      metaData
    }, instanceName);
  }

  /**
   * 创建 Node.js Readable 流从字符串
   */
  createReadableStreamFromString(content: string): Readable {
    return Readable.from([content]);
  }

  /**
   * 创建 Node.js Readable 流从 Buffer
   */
  createReadableStreamFromBuffer(buffer: Buffer): Readable {
    return Readable.from([buffer]);
  }

  /**
   * 上传文件并返回完整信息
   */
  async uploadFileWithInfo(options: UploadOptions, instanceName?: string): Promise<UploadResult> {
    const etag = await this.uploadFile(options, instanceName);
    
    return {
      etag,
      bucketName: options.bucketName,
      objectName: options.objectName,
      instanceName: instanceName || this.defaultInstance,
      size: options.size || (options.buffer ? options.buffer.length : undefined)
    };
  }

  /**
   * 下载文件
   */
  async downloadFile(options: DownloadOptions, instanceName?: string): Promise<Buffer> {
    const client = this.getClient(instanceName);
    const { bucketName, objectName, filePath, stream } = options;

    try {
      if (filePath) {
        // 下载到文件路径
        await client.fGetObject(bucketName, objectName, filePath);
        return Buffer.from(`File downloaded to: ${filePath}`);
      } else if (stream) {
        // 下载到流
        const dataStream = await this.getFileStream(bucketName, objectName, instanceName);
        return new Promise((resolve, reject) => {
          dataStream.pipe(stream);
          dataStream.on('end', () => {
            resolve(Buffer.from('Stream download completed'));
          });
          dataStream.on('error', (error: Error) => {
            reject(error);
          });
        });
      } else {
        // 返回缓冲区
        const dataStream = await this.getFileStream(bucketName, objectName, instanceName);
        return new Promise((resolve, reject) => {
          const chunks: Buffer[] = [];
          dataStream.on('data', (chunk: Buffer) => {
            chunks.push(Buffer.from(chunk));
          });
          dataStream.on('end', () => {
            resolve(Buffer.concat(chunks));
          });
          dataStream.on('error', (error: Error) => {
            reject(error);
          });
        });
      }
    } catch (error) {
      this.emit('downloadError', error, bucketName, objectName, instanceName);
      throw error;
    }
  }

  /**
   * 下载文件到指定路径
   */
  async downloadToFile(bucketName: string, objectName: string, filePath: string, instanceName?: string): Promise<void> {
    const client = this.getClient(instanceName);
    await client.fGetObject(bucketName, objectName, filePath);
  }

  /**
   * 获取文件流
   */
  async getFileStream(bucketName: string, objectName: string, instanceName?: string): Promise<Readable> {
    const client = this.getClient(instanceName);
    
    try {
      const stream = await client.getObject(bucketName, objectName);
      return stream;
    } catch (error) {
      throw new Error(`Failed to get object stream: ${error}`);
    }
  }

  /**
   * 获取文件信息
   */
  async statObject(bucketName: string, objectName: string, instanceName?: string): Promise<Minio.BucketItemStat> {
    const client = this.getClient(instanceName);
    return await client.statObject(bucketName, objectName);
  }

  /**
   * 删除文件
   */
  async removeObject(bucketName: string, objectName: string, instanceName?: string): Promise<void> {
    const client = this.getClient(instanceName);
    await client.removeObject(bucketName, objectName);
    this.emit('fileRemoved', bucketName, objectName, instanceName);
  }

  /**
   * 批量删除文件
   */
  async removeObjects(bucketName: string, objectNames: string[], instanceName?: string): Promise<RemoveObjectsResult> {
    const client = this.getClient(instanceName);
    
    try {
      // removeObjects 返回 Promise<RemoveObjectsResponse[]>
      const results = await client.removeObjects(bucketName, objectNames);
      
      const result: RemoveObjectsResult = {
        success: true,
        deleted: objectNames,
        errors: []
      };

      this.emit('objectsRemoved', bucketName, objectNames, instanceName);
      return result;

    } catch (error) {
      this.emit('removeObjectsError', error, bucketName, objectNames, instanceName);
      
      const result: RemoveObjectsResult = {
        success: false,
        deleted: [],
        errors: objectNames.map(name => ({
          objectName: name,
          error: error as Error
        }))
      };
      
      throw result;
    }
  }

  /**
   * 安全批量删除文件（忽略错误）
   */
  async removeObjectsSafe(bucketName: string, objectNames: string[], instanceName?: string): Promise<RemoveObjectsResult> {
    try {
      return await this.removeObjects(bucketName, objectNames, instanceName);
    } catch (error) {
      // 如果 removeObjects 抛出错误，返回错误结果但不重新抛出
      if (error && typeof error === 'object' && 'success' in error) {
        return error as RemoveObjectsResult;
      }
      
      const result: RemoveObjectsResult = {
        success: false,
        deleted: [],
        errors: objectNames.map(name => ({
          objectName: name,
          error: error as Error
        }))
      };
      
      return result;
    }
  }

  /**
   * 逐个删除文件（更可靠的方式）
   */
  async removeObjectsOneByOne(bucketName: string, objectNames: string[], instanceName?: string): Promise<RemoveObjectsResult> {
    const result: RemoveObjectsResult = {
      success: true,
      deleted: [],
      errors: []
    };

    for (const objectName of objectNames) {
      try {
        await this.removeObject(bucketName, objectName, instanceName);
        result.deleted.push(objectName);
      } catch (error) {
        result.errors.push({
          objectName,
          error: error as Error
        });
        result.success = false;
      }
    }

    if (result.deleted.length > 0) {
      this.emit('objectsRemoved', bucketName, result.deleted, instanceName);
    }
    
    if (result.errors.length > 0) {
      this.emit('removeObjectsError', result.errors, bucketName, objectNames, instanceName);
    }

    return result;
  }

  /**
   * 列出桶中的对象
   */
  async listObjects(bucketName: string, prefix?: string, recursive: boolean = true, instanceName?: string): Promise<Minio.BucketItem[]> {
    const client = this.getClient(instanceName);
    const objects: Minio.BucketItem[] = [];
    
    return new Promise((resolve, reject) => {
      const stream = client.listObjects(bucketName, prefix, recursive);
      
      stream.on('data', (obj: Minio.BucketItem) => objects.push(obj));
      stream.on('end', () => resolve(objects));
      stream.on('error', (error: Error) => reject(error));
    });
  }

  /**
   * 获取预签名 URL（用于下载）
   */
  async getPresignedUrl(bucketName: string, objectName: string, expires: number = 24 * 60 * 60, instanceName?: string): Promise<string> {
    const client = this.getClient(instanceName);
    return await client.presignedGetObject(bucketName, objectName, expires);
  }

  /**
   * 获取预签名上传 URL
   */
  async getPresignedPutUrl(bucketName: string, objectName: string, expires: number = 24 * 60 * 60, instanceName?: string): Promise<string> {
    const client = this.getClient(instanceName);
    return await client.presignedPutObject(bucketName, objectName, expires);
  }

  /**
   * 设置存储策略
   */
  async setBucketPolicy(bucketName: string, policy: string, instanceName?: string): Promise<void> {
    const client = this.getClient(instanceName);
    await client.setBucketPolicy(bucketName, policy);
  }

  /**
   * 获取存储策略
   */
  async getBucketPolicy(bucketName: string, instanceName?: string): Promise<string> {
    const client = this.getClient(instanceName);
    return await client.getBucketPolicy(bucketName);
  }

  /**
   * 健康检查
   */
  async healthCheck(instanceName?: string): Promise<boolean> {
    try {
      const client = this.getClient(instanceName);
      await client.listBuckets();
      return true;
    } catch (error) {
      this.emit('healthCheckFailed', error as Error, instanceName);
      return false;
    }
  }

  /**
   * 获取所有实例的健康状态
   */
  async getAllInstancesHealth(): Promise<{ [instanceName: string]: boolean }> {
    const healthStatus: { [instanceName: string]: boolean } = {};
    
    for (const instanceName of this.clients.keys()) {
      healthStatus[instanceName] = await this.healthCheck(instanceName);
    }
    
    return healthStatus;
  }

  /**
   * 获取实例数量
   */
  getInstanceCount(): number {
    return this.clients.size;
  }

  /**
   * 清理所有客户端
   */
  destroy(): void {
    this.clients.clear();
    this.removeAllListeners();
  }
}

export default MinioClientManager;