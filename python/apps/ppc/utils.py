"""
工具函数模块
"""

import os
import sys
import platform
from datetime import datetime

def get_system_info():
    """获取系统信息"""
    return {
        "操作系统": platform.system(),
        "系统版本": platform.version(),
        "机器类型": platform.machine(),
        "Python版本": platform.python_version(),
        "当前时间": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "工作目录": os.getcwd(),
        "命令行参数": " ".join(sys.argv),
    }

def calculate_stats(numbers):
    """
    计算一组数字的统计信息
    
    Args:
        numbers: 数字列表
    
    Returns:
        包含统计信息的字典
    """
    if not numbers:
        return {
            'sum': 0,
            'mean': 0,
            'max': 0,
            'min': 0,
            'count': 0
        }
    
    return {
        'sum': sum(numbers),
        'mean': sum(numbers) / len(numbers),
        'max': max(numbers),
        'min': min(numbers),
        'count': len(numbers)
    }

def color_text(text, color='green'):
    """为文本添加颜色（Linux/macOS）"""
    colors = {
        'red': '\033[91m',
        'green': '\033[92m',
        'yellow': '\033[93m',
        'blue': '\033[94m',
        'reset': '\033[0m'
    }
    
    # Windows 不支持 ANSI 颜色代码（除非启用）
    if platform.system() == 'Windows':
        return text
    
    color_code = colors.get(color, colors['reset'])
    return f"{color_code}{text}{colors['reset']}"