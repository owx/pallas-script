// examples/dm-example.js
import { DmMySQLManager } from '#utils/DmManager.js';

/**
 * 达梦数据库使用示例
 */
export async function dmExample() {
  const dmManager = new DmMySQLManager({
    host: '100.112.1.246',
    port: 5237,
    user: 'SYSDBA',
    password: 'xA7nI8kJ7_E0dU1nO8nI3gF3iF3eG0',
    database: 'ningxiang_pigxx',
    // charset: 'utf8mb4',
    // timezone: '+08:00',
    // connectionLimit: 10,
    // acquireTimeout: 30000,
    // reconnect: true
  });

  try {
    // 初始化连接
    // await dmManager.init();

    // // 1. 创建表
    // const createTableSQL = `
    //   CREATE TABLE IF NOT EXISTS users (
    //     id INT PRIMARY KEY,
    //     name VARCHAR(50),
    //     email VARCHAR(100),
    //     created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   )
    // `;
    
    // await dmManager.executeUpdate(createTableSQL);
    // console.log('表创建成功');

    // // 2. 插入数据
    // const insertSQL = 'INSERT INTO users (id, name, email) VALUES (?, ?, ?)';
    // await dmManager.executeUpdate(insertSQL, [1, '张三', 'zhangsan@example.com']);
    // await dmManager.executeUpdate(insertSQL, [2, '李四', 'lisi@example.com']);
    // console.log('数据插入成功');

    // 3. 查询数据
    const users = await dmManager.query('SELECT * FROM sys_user;');
    console.log('查询结果:', users);

    // // 4. 更新数据
    // const updateSQL = 'UPDATE users SET email = ? WHERE id = ?';
    // await dmManager.executeUpdate(updateSQL, ['new_email@example.com', 1]);
    // console.log('数据更新成功');

    // // 5. 再次查询验证更新
    // const updatedUsers = await dmManager.query('SELECT * FROM users WHERE id = ?', [1]);
    // console.log('更新后的数据:', updatedUsers);

  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    // 关闭连接
    await dmManager.close();
  }
}

// 运行示例
// dmExample().catch(console.error);