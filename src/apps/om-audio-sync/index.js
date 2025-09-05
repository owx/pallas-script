import { downloadOmAudioFiles, downloadFileWithProxy } from "./core.js";


app_start();


async function  app_start(){

  // await queryAudioFileList().then((resp)=>{
  //   console.log("resp", resp.data)
  // })

  
  // 每5秒执行一次
  // let count = 1;
  // const interval = setInterval(() => {
  //   console.log("\n------------------------" +  new Date().toLocaleString() + " 第" + count++ + "次执行 ------------------------")
  //   downloadOmAudioFiles();
  // }, 20000);

  // downloadOmAudioFiles();
  // 清除定时器
  // clearInterval(interval);


  // downloadFileWithProxy("https://rr3---sn-5hne6n6l.googlevideo.com/videoplayback?expire=1748529643&ei=ix04aL7fHLeCp-oP9pqNqAk&ip=176.6.140.93&id=o-AMwdaiMUHpYn-mWbDPMCYZy4zA7DvhkeKMXLLAPykhJw&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&bui=AY1jyLPkOKbKHM2sT9NQ_u4e2bUFIVI4D3qaFRhF60hFTPkj-8AgARWa8i8laAVKXFIF6QbWCXGNtZNN&spc=l3OVKaH4gTNVCgDPE-w5140bvkKODFa4hpt2_LGonsDJ5kz0LD2Y&vprv=1&svpuc=1&mime=audio%2Fmp4&ns=jilAMpCKl_262Dz-Ie7a3NIQ&rqh=1&gir=yes&clen=306973746&dur=18967.822&lmt=1681068947915737&keepalive=yes&fexp=24350590,24350737,24350827,24350961,24351173,24351316,24351318,24351495,24351528,24351594,24351638,24351658,24351662,24351759,24351789,24351864,24351907,24352018,24352020,24352022,24352101,51331020,51466697&c=MWEB&sefc=1&txp=6218224&n=taZT3P28xfBJfQ&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgQ6o5oqUEe2Z7RQU3F7WG0rIhzvJkZCM0-NB5BgC2C-cCIQCKtupe5cGovjjL_EiOAXdN46I4LLLQ5LPTMpu1nyL_yQ%3D%3D&pot=MnTh4RinmSYYruHdzWCJ7Uve1dftvVFE23LkhfsRJ2nNg-mE2EptJ9xnluwCwMf75Sr6cnuxaALZpO5eftn9M-ePfltUYJlrFQzKE9cRNdc1MDmxqFcBWfclfntXfKdbKu2VI0E-2NU486scPrnEpit4-sp8Bw==&rm=sn-4g5e6r7e&rrc=104,80&req_id=9b6c25a94868a3ee&ipbypass=yes&redirect_counter=2&cm2rm=sn-5hnesl7z&cms_redirect=yes&cmsv=e&met=1748508048,&mh=9N&mip=2a09:bac1:5520:28::3e4:4c&mm=34&mn=sn-5hne6n6l&ms=ltu&mt=1748507795&mv=m&mvi=3&pl=59&rms=ltu,au&lsparams=ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRQIhAJJQvzHQ6Jw730aRaTPRFnyCUrT8RZLC5U9jIwx9og-ZAiAOFdm37FTTjSQierWcdoTHIUxiTlBo6P_WB33M0mCwOQ%3D%3D", "test.data");
  downloadFileWithProxy('http://www.google.com', 'test.html')
}

