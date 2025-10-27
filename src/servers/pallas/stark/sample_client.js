import WebSocketServer from "./WebSocketServer.js";

// 创建WebSocket服务器实例
const server = new WebSocketServer(8080);

// 注册连接处理器
server.onConnection((ws, request) => {
  console.log('🎉 新的客户端连接:', ws.clientId);
  
  // 向新客户端发送欢迎消息
  server.sendToClient(ws, {
    type: 'system',
    message: '欢迎连接到WebSocket服务器!',
    clientId: ws.clientId,
    timestamp: new Date().toISOString()
  });
  
  // 广播新用户加入消息
  server.broadcast({
    type: 'notification',
    message: `新用户 ${ws.clientId} 加入聊天室`,
    timestamp: new Date().toISOString(),
    clientCount: server.getClientCount()
  });
});

// 注册消息处理器
server.onMessage((ws, message) => {
  console.log(`📩 收到来自 ${ws.clientId} 的消息:`, message);
  
  // 处理不同类型的消息
  switch (message.type) {
    case 'chat':
      // 广播聊天消息给所有客户端
      server.broadcast({
        type: 'chat',
        from: ws.clientId,
        content: message.content,
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'ping':
      // 响应ping消息
      server.sendToClient(ws, {
        type: 'pong',
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'private':
      // 私聊消息
      if (message.to && message.content) {
        const sent = server.sendToClientById(message.to, {
          type: 'private',
          from: ws.clientId,
          content: message.content,
          timestamp: new Date().toISOString()
        });
        
        // 通知发送者消息状态
        server.sendToClient(ws, {
          type: 'private_status',
          to: message.to,
          success: sent,
          timestamp: new Date().toISOString()
        });
      }
      break;
      
    default:
      // 未知消息类型，原样广播
      server.broadcast({
        ...message,
        from: ws.clientId,
        timestamp: new Date().toISOString()
      });
  }
});

// 注册关闭处理器
server.onClose((ws, code, reason) => {
  // 广播用户离开消息
  server.broadcast({
    type: 'notification',
    message: `用户 ${ws.clientId} 离开聊天室`,
    timestamp: new Date().toISOString(),
    clientCount: server.getClientCount()
  });
});

// 启动服务器
async function startServer() {
  try {
    await server.start();
    console.log('🚀 WebSocket服务器启动成功');
    
    // 每秒广播服务器时间（可选）
    setInterval(() => {
      server.broadcast({
        type: 'time',
        timestamp: new Date().toISOString(),
        clientCount: server.getClientCount()
      });
    }, 30000); // 每30秒广播一次
    
    // 定期显示服务器状态
    setInterval(() => {
      const clients = server.getClientsInfo();
      console.log(`📊 服务器状态 - 连接数: ${clients.length}`);
      if (clients.length > 0) {
        console.log('在线客户端:', clients.map(c => `${c.clientId} (${c.ip})`).join(', '));
      }
    }, 60000); // 每分钟显示一次状态
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n🛑 收到关闭信号，正在优雅关闭服务器...');
  await server.stop();
  console.log('👋 服务器已关闭');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 收到终止信号，正在优雅关闭服务器...');
  await server.stop();
  console.log('👋 服务器已关闭');
  process.exit(0);
});


// 启动服务器
startServer();