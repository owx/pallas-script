const http = require('http')
const fs = require('fs');
 
function traverseFolder(path) {
  fs.readdir(path, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return;
    }
 
    files.forEach((file) => {
      const filePath = path + '\\' + file;
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting stats for file:', file);
          return;
        }
 
        if (stats.isDirectory()) {
          traverseFolder(filePath); // 递归遍历子文件夹
        } else {
          // console.log(filePath); // 处理文件

          uploadFile(filePath);
        }
      });
    });
  });
}

// 使用示例：
traverseFolder('D:\\Download\\爱普图片131人');

//D:\\Download\\溧水分公司图片59人
//D:\Download\爱普图片131人

function uploadFile(filePath){
  idx =  filePath.lastIndexOf('\\');
  path = filePath.substr(0, idx+1);
  fileName = filePath.substr(idx+1, filePath.length-idx)

  // console.log("开始上传");

  var boundaryKey = '----WebKitFormBoundary' + new Date().getTime();
  var options = {
    host:"192.168.0.124",           //远端服务器域名
    port:8086,                      //远端服务器端口号
    method:'POST',
    path:'/admin/obs/uploadFile',   //上传服务路径
    headers:{
      'Content-Type':'multipart/form-data; boundary=' + boundaryKey,
      'Authorization':'Bearer 993d0841-9f7d-4f46-b96f-cb4dcdca9887',
    }
  };

  let newFileName = fileName.substr(0, 18) ;

  var req = http.request(options,function(res){
    res.setEncoding('utf8');
    res.on('data', function (body) {
      // console.log(boundaryKey);
      // console.log('body: ' + data);
      let json = JSON.parse(body)
      let url = json.data;

      // console.log(newFileName + url)



      // 南京爱普雷德电子科技有限公司  91320106598026722K
      // 南京爱普雷德电子科技有限公司溧水分公司 91320117MA7F9K2L11
      console.log('Update cri_apply_consumption_quota set completion_status=2, material_bill="' + url + '" where id_card="' + newFileName + '"  and credit_code="91320106598026722K" and del_flag=0 and completion_status=0')
    });

    res.on('end',function(){
      // hebing(id);
      // console.log('res end.');
    });
  });

  req.write(
    '--' + boundaryKey + '\r\n' +
    'Content-Disposition: form-data; name="uploadFile"; filename=' + fileName + '\r\n' +
    'Content-Type:video/webm\r\n\r\n'
  );

  var fileStream = fs.createReadStream(filePath, {bufferSize:1024 * 1024 * 50});
  fileStream.pipe(req,{end:false});
  fileStream.on('end',function(){
    req.end('\r\n--' + boundaryKey + '--');
  });
}

//uploadFile("D:\\Download\\0.jpeg");
