#!/usr/bin/env python3
"""
mitm 请求数据解码插件

功能：自动识别包含 encryption 和 timestamp 字段的响应并解密
备注：依赖系统的python环境，mitm自带pip环境缺少相应的AES包
"""

import json
import base64
import logging
from Crypto.Cipher import AES
from typing import Optional, Tuple, Dict, Any
from mitmproxy import contentviews
from mitmproxy.contentviews import InteractiveContentview, Metadata

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

# ========== 配置区域 ==========
CONFIG = {
    "enabled": True,
    "token": "your_token_here",  # 替换为你的实际 Token（不带 Bearer）
    "debug": True,  # 是否输出调试信息
}


class AplidEncrypt:
    """加密工具类，对应 TypeScript 版本的 EncryptUtil"""
    
    def __init__(self):
        self.default_key1 = '11111111111111'
        self.default_key2 = '22222222222222'
    
    def aes_decrypt(self, data: str, keystr: str) -> str:
        """
        AES-CFB 解密，对应 TypeScript 的 aesDecrypt
        """
        try:
            # 处理 key（UTF-8 编码）
            key = keystr.encode('utf-8')
            
            # 补齐或截断 key 到 16/24/32 字节
            if len(key) < 16:
                key = key.ljust(16, b'\x00')
            elif len(key) > 32:
                key = key[:32]
            elif len(key) > 16 and len(key) < 24:
                key = key.ljust(24, b'\x00')
            elif len(key) > 24 and len(key) < 32:
                key = key.ljust(32, b'\x00')
            
            # IV 等于 key（前16字节）
            iv = key[:16]
            
            # Base64 解码密文
            ciphertext = base64.b64decode(data)
            
            # AES-CFB 解密
            cipher = AES.new(key, AES.MODE_CFB, iv=iv, segment_size=128)
            plaintext_bytes = cipher.decrypt(ciphertext)
            
            # 解码为 UTF-8 字符串
            plaintext = plaintext_bytes.decode('utf-8').rstrip('\x00')
            
            return plaintext
            
        except Exception as e:
            logger.error(f"AES解密失败: {e}")
            raise
    
    def decrypt(self, encrypt_data: Dict[str, Any], token: Optional[str] = None) -> str:
        """
        解密方法，对应 TypeScript 的 decrypt
        
        Args:
            encrypt_data: 包含 encryption 和可选 timestamp 的字典
            token: 可选的 token
        
        Returns:
            解密后的字符串
        """
        encryption = encrypt_data.get('encryption', '')
        timestamp = encrypt_data.get('timestamp')
        
        # 如果没有 token 或 timestamp，使用默认密钥尝试解密
        if not token or not timestamp:
            logger.debug("使用默认密钥解密")
            try:
                return self.aes_decrypt(encryption, self.default_key1)
            except Exception:
                return self.aes_decrypt(encryption, self.default_key2)
        
        # 处理 token 中的空格（如 "Bearer xxx"）
        if ' ' in token:
            token = token.split(' ')[1]
        logger.debug(f"token: {token}")
        
        try:
            # 一层解密
            last_char = timestamp[-1]
            start = int(last_char)
            key1 = token[start:start + 16]
            logger.debug(f"key1: {key1}")
            
            first_level_data = self.aes_decrypt(encryption, key1)
            logger.debug(f"firstLevelData: {first_level_data}")
            
            # 二层解密
            last_char = first_level_data[-1]
            start = int(last_char)
            coded_key2 = first_level_data[start:start + 36]
            logger.debug(f"codedKey2: {coded_key2}")
            
            # 解码 key2 (相当于 JS 的 decodeURIComponent(escape(atob(codedKey2))))
            # atob: base64 解码
            # escape: 已废弃，在 Python 中需要特殊处理
            # decodeURIComponent: 解码 URL 编码
            key2_str = self._decode_coded_key(coded_key2)
            logger.debug(f"key2Str: {key2_str}")
            
            key2 = key2_str[10:]  # 去掉前10个字符
            logger.debug(f"key2: {key2}")
            
            # 移除 coded_key2 部分
            secord_level_data = first_level_data[:-1]  # 去掉最后一个字符
            secord_level_data = secord_level_data[:start] + secord_level_data[start + 36:]
            logger.debug(f"secordLevelData length: {len(secord_level_data)}")
            
            # 最终解密
            final_level_data = self.aes_decrypt(secord_level_data, key2)
            logger.debug(f"finalLevelData: {final_level_data}")
            
            return final_level_data
            
        except Exception as e:
            logger.error(f"解密失败: {e}")
            # 失败时使用默认密钥
            try:
                return self.aes_decrypt(encryption, self.default_key1)
            except Exception:
                return self.aes_decrypt(encryption, self.default_key2)
    
    def _decode_coded_key(self, coded_key: str) -> str:
        """
        解码 coded_key
        对应 JS: decodeURIComponent(escape(atob(codedKey2)))
        
        atob: Base64 解码
        escape: URL 编码（非 ASCII 字符转为 %xx 格式）
        decodeURIComponent: URL 解码
        """
        try:
            # atob: Base64 解码
            decoded_bytes = base64.b64decode(coded_key)
            
            # 尝试解码为 Latin-1 以保留原始字节
            decoded_str = decoded_bytes.decode('latin-1')
            
            # 处理 URL 编码的字符
            # Python 的 unquote 可以处理 %xx 格式
            from urllib.parse import unquote
            result = unquote(decoded_str)
            
            return result
            
        except Exception as e:
            logger.error(f"解码 coded_key 失败: {e}")
            # 降级方案：直接尝试 UTF-8 解码
            try:
                return base64.b64decode(coded_key).decode('utf-8')
            except:
                raise


# ========== 双层解密器 ==========
class DoubleLayerDecryptor:
    """双层动态密钥解密器"""
    
    def __init__(self, token: str):
        self.token = token
        logger.info(f"解密器初始化完成，Token长度: {len(token)}")
    
    def decrypt_first_layer(self, encrypted_data: str, timestamp: str) -> Optional[str]:
        """
        第一层解密
        流程：
        1. 获取时间戳最后一位作为起始位置
        2. 从 Token 中截取16位作为第一层密钥
        3. 使用该密钥解密数据
        """
        try:
            if not encrypted_data or not timestamp:
                logger.error("加密数据或时间戳为空")
                return None
            
            # 调试信息
            if CONFIG["debug"]:
                logger.debug(f"加密数据长度: {len(encrypted_data)}")
                logger.debug(f"时间戳: {timestamp}")
                logger.debug(f"加密数据前50字符: {encrypted_data[:50]}")
            
            # 1. 获取时间戳最后一位
            last_char = timestamp[-1]
            logger.debug(f"时间戳最后一位: {last_char}")
            
            # 2. 转换为起始索引
            if last_char.isdigit():
                start_index = int(last_char)
            else:
                # 如果不是数字，使用 ASCII 码模 16
                start_index = ord(last_char) % 16
            
            logger.debug(f"起始索引: {start_index}")
            
            # 3. 检查 Token 长度
            if start_index >= len(self.token):
                logger.error(f"起始索引 {start_index} 超出 Token 长度 {len(self.token)}")
                return None
            
            # 4. 截取16位作为第一层密钥
            token_remaining = len(self.token) - start_index
            if token_remaining >= 16:
                first_key = self.token[start_index:start_index + 16]
            else:
                # 如果不够16位，从头循环补充
                first_key = self.token[start_index:] + self.token[:16 - token_remaining]
            
            logger.debug(f"第一层密钥: {first_key}")
            
            # 5. 使用第一层密钥解密
            decrypted = self._decrypt_data(encrypted_data, first_key)
            
            if decrypted:
                logger.info("第一层解密成功")
                if CONFIG["debug"]:
                    logger.debug(f"第一层解密结果前100字符: {decrypted[:100]}")
                return decrypted
            else:
                logger.error("第一层解密失败")
                return None
                
        except Exception as e:
            logger.error(f"第一层解密异常: {e}")
            return None
    
    def decrypt_second_layer(self, first_layer_data: str) -> Optional[Tuple[str, str]]:
        """
        第二层解密
        流程：
        1. 获取第一层数据的最后一位作为截取位置
        2. 截取36位字符串
        3. Base64 解码
        4. 去掉前10位时间戳，得到第二层密钥
        5. 提取数据密文（去掉36位密钥部分和1位位置标记）
        6. 使用第二层密钥解密数据密文
        """
        try:
            if not first_layer_data or len(first_layer_data) < 37:
                logger.error(f"第一层数据长度不足: {len(first_layer_data) if first_layer_data else 0}")
                return None
            
            # 调试信息
            if CONFIG["debug"]:
                logger.debug(f"第一层数据长度: {len(first_layer_data)}")
                logger.debug(f"第一层数据后50字符: {first_layer_data[-50:]}")
            
            # 1. 获取最后一位作为截取位置
            last_char = first_layer_data[-1]
            logger.debug(f"第二层截取位置标识: {last_char}")
            
            # 2. 转换为起始索引
            if last_char.isdigit():
                start_index = int(last_char)
            else:
                start_index = ord(last_char) % 36
            
            logger.debug(f"第二层起始索引: {start_index}")
            
            # 3. 截取36位字符串
            data_remaining = len(first_layer_data) - 1  # 减去最后一位标记位
            if start_index + 36 > data_remaining:
                # 如果不够36位，从开头循环补充
                key_part_end = first_layer_data[start_index:]
                key_part_start = first_layer_data[:36 - len(key_part_end)]
                key_part = key_part_end + key_part_start
            else:
                key_part = first_layer_data[start_index:start_index + 36]
            
            logger.debug(f"截取的密钥部分: {key_part}")
            
            # 4. Base64 解码
            try:
                decoded_key_part = base64.b64decode(key_part)
                logger.debug(f"Base64解码后字节长度: {len(decoded_key_part)}")
                
                # 尝试解码为字符串
                try:
                    decoded_key_str = decoded_key_part.decode('utf-8')
                except UnicodeDecodeError:
                    decoded_key_str = decoded_key_part.decode('latin-1')
                
                logger.debug(f"Base64解码后字符串: {decoded_key_str[:50]}")
            except Exception as e:
                logger.error(f"Base64解码失败: {e}")
                return None
            
            # 5. 去掉前10位时间戳，得到第二层密钥
            if len(decoded_key_str) < 10:
                logger.error(f"解码后长度不足10位: {len(decoded_key_str)}")
                return None
            
            second_key = decoded_key_str[10:]
            logger.debug(f"第二层密钥: {second_key}")
            
            # 6. 提取数据密文（去掉最后37位：36位密钥部分 + 1位位置标记）
            data_ciphertext = first_layer_data[:-(36 + 1)]
            
            if not data_ciphertext:
                logger.error("数据密文为空")
                return None
            
            logger.debug(f"数据密文长度: {len(data_ciphertext)}")
            
            # 7. 使用第二层密钥解密数据密文
            decrypted_data = self._decrypt_data(data_ciphertext, second_key)
            
            if decrypted_data:
                logger.info("第二层解密成功")
                if CONFIG["debug"]:
                    logger.debug(f"最终数据前200字符: {decrypted_data[:200]}")
                return decrypted_data, second_key
            else:
                logger.error("第二层解密失败")
                return None
                
        except Exception as e:
            logger.error(f"第二层解密异常: {e}")
            return None
    
    def _decrypt_data(self, encrypted_text: str, key: str) -> Optional[str]:
        """
        使用密钥解密数据
        支持多种解密方式
        """
        try:
            # 1. 解码密文（假设是 Base64 编码）
            try:
                ciphertext = base64.b64decode(encrypted_text)
                logger.debug(f"Base64解码成功，密文长度: {len(ciphertext)}")
            except Exception as e:
                logger.debug(f"Base64解码失败，尝试其他方式: {e}")
                # 如果不是 Base64，尝试作为原始字符串
                ciphertext = encrypted_text.encode('utf-8')
            
            # 2. 准备密钥字节
            key_bytes = key.encode('utf-8')
            
            # 3. 尝试 AES 解密
            result = self._aes_decrypt(ciphertext, key_bytes)
            if result:
                return result
            
            # 4. 尝试 XOR 解密
            result = self._xor_decrypt(ciphertext, key_bytes)
            if result:
                return result
            
            # 5. 如果都不行，尝试直接解码
            try:
                return ciphertext.decode('utf-8')
            except:
                return ciphertext.hex()
                
        except Exception as e:
            logger.error(f"数据解密失败: {e}")
            return None
    
    def _aes_decrypt(self, ciphertext: bytes, key: bytes) -> Optional[str]:
        """AES 解密"""
        try:
            from Crypto.Cipher import AES
            from Crypto.Util.Padding import unpad
            
            # 确保密钥长度符合要求
            if len(key) < 16:
                key = key.ljust(16, b'\0')
            elif len(key) > 32:
                key = key[:32]
            
            # 尝试 CBC 模式
            try:
                iv = key[:16]
                cipher = AES.new(key[:32], AES.MODE_CBC, iv)
                plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)
                return plaintext.decode('utf-8')
            except Exception as e:
                logger.debug(f"AES-CBC 解密失败: {e}")
            
            # 尝试 ECB 模式
            try:
                cipher = AES.new(key[:32], AES.MODE_ECB)
                plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)
                return plaintext.decode('utf-8')
            except Exception as e:
                logger.debug(f"AES-ECB 解密失败: {e}")
            
            return None
            
        except ImportError:
            logger.warning("pycryptodome 未安装，请运行: pip install pycryptodome")
            return None
        except Exception as e:
            logger.debug(f"AES 解密异常: {e}")
            return None
    
    def _xor_decrypt(self, ciphertext: bytes, key: bytes) -> Optional[str]:
        """XOR 解密"""
        try:
            plaintext_bytes = bytes([
                ciphertext[i] ^ key[i % len(key)] 
                for i in range(len(ciphertext))
            ])
            
            # 尝试解码为 UTF-8
            try:
                return plaintext_bytes.decode('utf-8')
            except UnicodeDecodeError:
                # 尝试 GBK
                try:
                    return plaintext_bytes.decode('gbk')
                except:
                    return plaintext_bytes.hex()
                    
        except Exception as e:
            logger.debug(f"XOR 解密失败: {e}")
            return None
    
    def decrypt_full(self, encrypted_data: str, timestamp: str) -> Optional[Dict[str, Any]]:
        """
        完整的双层解密流程
        返回包含解密结果和调试信息的字典
        """
        logger.info("=" * 50)
        logger.info("开始双层解密流程")
        
        result = {
            "success": False,
            "data": None,
            "first_layer": None,
            "second_key": None,
            "error": None
        }
        
        # 第一层解密
        first_layer = self.decrypt_first_layer(encrypted_data, timestamp)
        if not first_layer:
            result["error"] = "第一层解密失败"
            logger.error(result["error"])
            return result
        
        result["first_layer"] = first_layer[:200]  # 保存前200字符用于调试
        
        # 第二层解密
        second_result = self.decrypt_second_layer(first_layer)
        if not second_result:
            result["error"] = "第二层解密失败"
            logger.error(result["error"])
            return result
        
        final_data, second_key = second_result
        result["success"] = True
        result["data"] = final_data
        result["second_key"] = second_key
        
        logger.info("双层解密成功完成")
        logger.info("=" * 50)
        
        return result


# ========== 检测加密响应 ==========
def detect_encrypted_response(data: bytes) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    检测是否为包含 encryption 和 timestamp 字段的加密响应
    """
    try:
        text = data.decode('utf-8', errors='replace')
        json_obj = json.loads(text)
        
        has_encryption = 'encryption' in json_obj
        has_timestamp = 'timestamp' in json_obj
        
        if has_encryption and has_timestamp:
            encryption = str(json_obj.get('encryption', ''))
            timestamp = str(json_obj.get('timestamp', ''))
            
            if encryption and timestamp:
                logger.info(f"检测到加密响应，timestamp: {timestamp}")
                return True, encryption, timestamp
        
        return False, None, None
        
    except (json.JSONDecodeError, UnicodeDecodeError):
        return False, None, None
    except Exception as e:
        logger.debug(f"检测加密响应异常: {e}")
        return False, None, None


# ========== 格式化工具 ==========
def format_json_response(data: bytes) -> Optional[str]:
    """格式化 JSON 响应"""
    try:
        json_obj = json.loads(data.decode('utf-8'))
        return json.dumps(json_obj, indent=2, ensure_ascii=False)
    except:
        return None


def format_raw_response(data: bytes) -> str:
    """格式化原始响应"""
    try:
        text = data.decode('utf-8', errors='replace')
        if text.isprintable() or '\n' in text:
            return text
        return f"[二进制数据]\nHex: {data.hex()}\n长度: {len(data)} bytes"
    except:
        return data.hex()


# ========== 全局解密器 ==========
decryptor = DoubleLayerDecryptor(CONFIG["token"])
aplidDecryptor = AplidEncrypt()


# ========== 自定义视图 ==========
class DoubleLayerDecryptView(InteractiveContentview):
    """双层动态密钥解密视图"""
    
    def __init__(self):
        self._name = "Aplid解密"
    
    @property
    def name(self) -> str:
        return self._name
    
    @name.setter
    def name(self, value: str):
        self._name = value
    
    def prettify(self, data: bytes, metadata: Metadata) -> str:
        """处理并显示数据"""

        # 从 metadata 中获取 flow
        flow = getattr(metadata, 'flow', None)
        if flow and flow.request:
            # 获取 Authorization 头
            auth_header = flow.request.headers.get("Authorization", "")
            
            # 去掉 Bearer 前缀
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]
            else:
                token = auth_header
            
            # 现在可以使用 token 了
            logger.info(f"从视图获取到 Token: {token[:20]}...")


        # 检测是否为加密响应
        is_encrypted, encryption, timestamp = detect_encrypted_response(data)
        
        if is_encrypted and encryption and timestamp and CONFIG["enabled"]:
            # 执行解密
            # result = decryptor.decrypt_full(encryption, timestamp)

            result = aplidDecryptor.decrypt({"encryption": encryption, "timestamp": timestamp}, token)
            logger.info("解密result：" + result)

            formatted1 = format_json_response(result.encode())
            if formatted1:
                return formatted1
            return result

            # 解析原始 JSON
            # try:
            #     original_json = json.loads(data.decode('utf-8'))
            # except:
            #     original_json = {"_raw": data.decode('utf-8', errors='replace')}
            
            # # 构建显示结果
            # display_json = original_json.copy()
            
            # if result["success"]:
            #     # 解密成功
            #     try:
            #         # 尝试将解密数据解析为 JSON
            #         decrypted_json = json.loads(result["data"])
            #         display_json["encryption"] = decrypted_json
            #     except:
            #         display_json["encryption"] = result["data"]
                
            #     display_json["_decrypted"] = True
            #     display_json["_debug"] = {
            #         "success": True,
            #         "first_layer_preview": result["first_layer"],
            #     }
            #     logger.info("解密成功，已更新显示")
            # else:
            #     # 解密失败
            #     display_json["_decrypted"] = False
            #     display_json["_error"] = result["error"]
            #     display_json["_debug"] = {
            #         "timestamp": timestamp,
            #         "encryption_preview": encryption[:100] + "..." if len(encryption) > 100 else encryption
            #     }
            #     logger.error(f"解密失败: {result['error']}")
            
            # return json.dumps(display_json, indent=2, ensure_ascii=False)
        
        # 非加密响应：格式化 JSON 或显示原始内容
        formatted = format_json_response(data)
        if formatted:
            return formatted
        return format_raw_response(data)
    
    def reencode(self, prettified: str, metadata: Metadata) -> bytes:
        """重新编码（支持编辑）"""
        try:
            edited_json = json.loads(prettified)
            # 移除调试字段
            edited_json.pop('_decrypted', None)
            edited_json.pop('_debug', None)
            edited_json.pop('_error', None)
            return json.dumps(edited_json, ensure_ascii=False).encode('utf-8')
        except:
            return prettified.encode('utf-8')

# ========== Addon 类 ==========
class DecryptAddon:
    """可选的 Addon，用于自动修改响应"""
    # def request(self, flow: http.HTTPFlow):
    #     auth = flow.request.headers.get("Authorization", "")
    #     if auth:
    #         if auth.startswith("Bearer "):
    #             token = auth[7:]
    #         else:
    #             token = auth
    #         token_cache[flow.id] = token
    #         logger.info(f"捕获 Token: {flow.request.pretty_url}")


    def response(self, flow):
        """处理响应"""
        if not CONFIG["enabled"]:
            return
        
        if flow.response and flow.response.content:
            is_encrypted, encryption, timestamp = detect_encrypted_response(flow.response.content)
            
            if is_encrypted and encryption and timestamp:
                logger.info(f"自动解密响应: {flow.request.pretty_url}")
                # result = decryptor.decrypt_full(encryption, timestamp)
                result = aplidDecryptor.decrypt({"encryption": encryption, "timestamp": timestamp}, token)
                logger.info("解密result：" + result)

                formatted1 = format_json_response(result.encode())
                if formatted1:
                    logger.info("已自动修改响应内容")
                    flow.response.text = formatted1;
                    # return formatted1
                flow.response.text = result;
                
                # if result["success"]:
                #     try:
                #         original_json = json.loads(flow.response.text)
                #         original_json["encryption"] = result["data"]
                #         flow.response.text = json.dumps(original_json, ensure_ascii=False)
                #         logger.info("已自动修改响应内容")
                #     except Exception as e:
                #         logger.error(f"修改响应失败: {e}")


# ========== 注册扩展 ==========
# 添加自定义视图
contentviews.add(DoubleLayerDecryptView())

# 添加 Addon（如需自动修改响应，取消注释）
addons = [
    # DecryptAddon(),  # 取消注释启用自动修改
]

# 启动信息
print("\n" + "=" * 70)
print("双层动态密钥解密插件已加载")
print("=" * 70)
print(f"配置状态:")
print(f"  - 解密功能: {'启用' if CONFIG['enabled'] else '禁用'}")
print(f"  - Token长度: {len(CONFIG['token'])}")
print(f"  - 调试模式: {'开启' if CONFIG['debug'] else '关闭'}")
print(f"\n使用说明:")
print(f"  1. 在 mitmweb 界面选择 '双层解密视图' 查看解密结果")
print(f"  2. 检查日志输出了解解密过程")
print(f"  3. 如解密失败，查看 '_error' 字段获取错误信息")
print("=" * 70 + "\n")