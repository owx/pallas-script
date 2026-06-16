import dm from'dmdb';

export async function tryDifferentMethods() {
  const config = {
    user: 'SYSDBA',
    password: 'xA7nI8kJ7_E0dU1nO8nI3gF3iF3eG0', 
    host: '100.112.1.246',
    port: 5237,
    database: 'ningxiang'
  };

  // 尝试各种可能的连接方法
  const methods = [
    'createConnection',
    'getConnection', 
    'createClient',
    'createPool',
    'Connection'
  ];

  for (const method of methods) {
    try {
      console.log(`尝试方法: ${method}`);
      
      if (method === 'Connection' && dm[method]) {
        // 如果是构造函数
        const conn = new dm[method](config);
        await conn.connect();
        console.log(`✓ ${method} 成功!`);
        await conn.close();
        break;
      } else if (dm[method] && typeof dm[method] === 'function') {
        // 如果是工厂函数
        const conn = await dm[method](config);
        console.log(`✓ ${method} 成功!`);
        await conn.close();
        break;
      }
    } catch (error) {
      console.log(`✗ ${method} 失败: ${error.message}`);
    }
  }
}
