#!/usr/bin/env python3
"""
命令行工具主入口
"""

import sys
import argparse
from datetime import datetime
from .utils import get_system_info, calculate_stats

def hello_cmd():
    """hello 命令的入口点"""
    parser = argparse.ArgumentParser(description="打招呼命令")
    parser.add_argument('--name', default='World', help='要打招呼的名字')
    parser.add_argument('--count', type=int, default=1, help='重复次数')
    
    # 手动解析参数（因为是从 entry point 直接调用）
    args = parser.parse_args()
    
    for i in range(args.count):
        print(f"Hello, {args.name}!")
    
    return 0

def stats_cmd():
    """stats 命令的入口点"""
    print("系统信息统计")
    print("-" * 40)
    
    info = get_system_info()
    for key, value in info.items():
        print(f"{key:15}: {value}")
    
    # 演示数据处理
    sample_data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    stats = calculate_stats(sample_data)
    
    print("-" * 40)
    print("数据统计示例")
    for key, value in stats.items():
        print(f"{key:15}: {value}")
    
    return 0

def main():
    """
    主入口函数 - 支持子命令
    用法: ppc [command] [options]
    """
    # 创建主解析器
    parser = argparse.ArgumentParser(
        description="ppc - 多功能命令行工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  ppc greet --name Alice           # 打招呼
  ppc greet --name Bob --count 3   # 重复打招呼3次
  ppc info                         # 显示系统信息
  ppc calc 1 2 3 4 5               # 计算一组数字
  ppc --version                    # 显示版本号
        """
    )
    
    # 全局选项
    parser.add_argument('--version', action='store_true', help='显示版本号')
    parser.add_argument('--verbose', '-v', action='store_true', help='显示详细信息')
    
    # 子命令
    subparsers = parser.add_subparsers(dest='command', help='子命令')
    
    # greet 子命令
    greet_parser = subparsers.add_parser('greet', help='打招呼')
    greet_parser.add_argument('--name', default='World', help='名字')
    greet_parser.add_argument('--count', type=int, default=1, help='重复次数')
    
    # info 子命令
    info_parser = subparsers.add_parser('info', help='显示系统信息')
    
    # calc 子命令
    calc_parser = subparsers.add_parser('calc', help='计算数字')
    calc_parser.add_argument('numbers', type=float, nargs='+', help='要计算的数字')
    
    # 解析参数
    args = parser.parse_args()
    
    # 处理全局选项
    if args.version:
        from . import __version__
        print(f"ppc version {__version__}")
        return 0
    
    # 处理子命令
    if args.command == 'greet':
        for i in range(args.count):
            print(f"Hello, {args.name}!")
        return 0
        
    elif args.command == 'info':
        info = get_system_info()
        print("\n系统信息:")
        print("=" * 40)
        for key, value in info.items():
            print(f"{key:20}: {value}")
        return 0
        
    elif args.command == 'calc':
        if args.numbers:
            stats = calculate_stats(args.numbers)
            print(f"\n数字: {args.numbers}")
            print("=" * 40)
            print(f"总和: {stats['sum']}")
            print(f"平均值: {stats['mean']:.2f}")
            print(f"最大值: {stats['max']}")
            print(f"最小值: {stats['min']}")
            print(f"计数: {stats['count']}")
        return 0
        
    else:
        # 没有提供子命令时显示帮助
        parser.print_help()
        return 0

# 如果直接运行此文件
if __name__ == '__main__':
    sys.exit(main())