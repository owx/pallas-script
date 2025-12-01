// lib/dm-mysql-compat.js
import mysql from 'mysql2/promise';

/**
 * 达梦数据库 MySQL 兼容连接
 * 注意：这需要达梦数据库支持 MySQL 协议
 */
export class DmMySQLManager {
  constructor(config) {
    this.pool = mysql.createPool({
      host: config.host || 'localhost',
      port: config.port || 5236,
      user: config.username || 'SYSDBA',
      password: config.password || 'SYSDBA',
      database: config.database || 'DAMENG',
      charset: 'utf8mb4',
      timezone: '+08:00',
      connectionLimit: 10,
      acquireTimeout: 30000,
      reconnect: true
    });
  }

  /**
   * 执行查询
   */
  async query(sql, params = []) {
    try {
      const [rows, fields] = await this.pool.execute(sql, params);
      return { rows, fields };
    } catch (error) {
      console.error('查询执行失败:', error);
      throw error;
    }
  }

  /**
   * 获取连接
   */
  async getConnection() {
    return await this.pool.getConnection();
  }

  /**
   * 执行事务
   */
  async executeTransaction(callback) {
    const connection = await this.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 关闭连接池
   */
  async close() {
    await this.pool.end();
    console.log('数据库连接池已关闭');
  }
}