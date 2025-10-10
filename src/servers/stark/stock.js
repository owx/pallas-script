import axios from 'axios';


/**
 * 
 * 参数名	是否必须	描述	示例
 * secid	是	股票代码标识符。由市场代码和股票代码组成，用点号分隔。	0.000001 (深圳平安) 1.600036 (上海招商银行)
 * ut	否	来源标识，通常固定值即可。	fa077fd5b9a9c22c6a68a7a5c7a7b29f
 * fltt	否	价格相关小数位数。	2
 * invt	否	估值相关，通常为 2。	2
 * fields	是	指定返回哪些数据字段。这是一个用逗号分隔的字符串，是使用此接口的关键。	f43,f44,f45,f46,f60
 * 
 * 
 * 重点1： secid (市场代码)
0 开头代表 深圳证券交易所 的股票

示例： 平安银行 -> 代码 000001 -> secid=0.000001

1 开头代表 上海证券交易所 的股票

示例： 招商银行 -> 代码 600036 -> secid=1.600036

对于基金、指数等，规则类似，但市场代码可能不同（例如创业板股票 0.300XXX）。

重点2： fields (数据字段)
这是接口的核心，你需要在 fields 参数中指定你关心哪些数据。接口定义了大量的字段代码，以下是一些最常用的：

字段代码	描述	示例值
f43	最新价（实时）	12.35
f44	最高价	12.50
f45	最低价	12.20
f46	今开	12.30
f47	成交量（手）	1234567
f48	成交额（元）	1523456789
f49	外盘	611200
f50	量比	1.23
f57	股票代码	000001
f58	股票名称	平安银行
f60	昨日收盘价	12.25
f84	总市值	239588395520
f85	流通市值	239588290560
f116	总市值（格式化）	2395.88亿
f117	流通市值（格式化）	2395.88亿
f169	涨跌幅	10 (代表 1.0%， 即 10/100)
f170	涨跌额	0.10
你可以根据需要自由组合这些字段，例如：fields=f57,f58,f43,f60,f44,f45,f46,f169,f170
 * 
 * 
 */

export async function fetchRealTimeData(secid="106.BABA") {
  let url = "http://push2.eastmoney.com/api/qt/stock/get";

  let params = {
    secid: secid,
    ut: "fa5fd1943c7b386f172d6893dbfba10b",
    fltt: 3,
    invt: 2,
    fields: "f43,f44,f44,f45,f46,f47,f48,f49,f50,f57,f58,f60,f44,f45,f46,f169,f170",
    // fields: "f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287",
  }

  return axios.get(url, {params: params});
}



// 获取股票实时数据（模拟实现，实际中可以使用第三方API）
// async function fetchStockData(symbol) {
//   try {
//     // const url = "http://push2.eastmoney.com/api/qt/stock/get?ut=fa5fd1943c7b386f172d6893dbfba10b&invt=2&fltt=2&fields=f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287&secid=106.BABA";
//     const url = "http://push2.eastmoney.com/api/qt/stock/get?ut=fa5fd1943c7b386f172d6893dbfba10b&invt=2&fltt=3&fields=f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287&secid=106.BABA";

//     // 实际项目中替换为真实的股票API
//     const response = await axios.get(url);
//     return response.data;
    
//     // 模拟数据
//     // return {
//     //   symbol,
//     //   price: (Math.random() * 1000).toFixed(2),
//     //   volume: Math.floor(Math.random() * 1000000)
//     // };
//   } catch (error) {
//     console.error(`Error fetching data for ${symbol}:`, error);
//     return null;
//   }
// }