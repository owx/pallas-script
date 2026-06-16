"""
mycli - 一个示例命令行工具
"""

__version__ = "0.1.0"
__author__ = "Your Name"

# 导出主要函数，方便其他模块导入
from .cli import main, hello_cmd, stats_cmd

__all__ = ["main", "hello_cmd", "stats_cmd"]