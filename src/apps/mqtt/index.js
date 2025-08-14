const mqtt = require('mqtt')

const radar = require('./radar.js')

// 连接选项
const options = {
  clientId: 'radarMqtt',
  username: 'emqx', // 如果需要认证
  password: 'public', // 如果需要认证
  clean: true,
  connectTimeout: 4000, // 超时时间
  reconnectPeriod: 1000 // 重连间隔
}

// 连接 MQTT 代理服务器
const client = mqtt.connect('mqtt://116.62.40.103:1883', options)

// 连接成功回调
client.on('connect', () => {
  console.log('Connected to MQTT broker')
  
  // 订阅主题
  client.subscribe('mm_detect_data/#', { qos: 1 }, (err) => {
    if (!err) {
      console.log('Subscribed to topic successfully')
    }
  })
})

// 接收消息回调
client.on('message', (topic, message) => {
  // message 是 Buffer 类型，需要转换为字符串
//   console.log(`Received message from ${topic}: ${message.toString()}`)
  
// if(topic != "mm_detect_data"){
    radar.handlerMessage(topic, message);
// }

  // 如果需要 JSON 数据
//   try {
//     const data = JSON.parse(message.toString())
//     console.log('Parsed data:', data)
//   } catch (e) {
//     console.log('Received non-JSON message')
//   }
})

// 错误处理
client.on('error', (err) => {
  console.error('Connection error:', err)
  client.end()
})

client.on('close', () => {
  console.log('Connection closed')
})

// 在适当的时候断开连接
// client.end()