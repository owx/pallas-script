#!/usr/bin/env python3
import sys
import argparse

from .commands import COMMANDS


def main():
    parser = argparse.ArgumentParser(
        description="ppc - 多功能命令行工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""\
示例:
  ppc greet --name Alice           # 打招呼
  ppc greet --name Bob --count 3   # 重复打招呼3次
  ppc info                         # 显示系统信息
  ppc calc 1 2 3 4 5               # 计算一组数字
  ppc --version                    # 显示版本号
        """,
    )

    parser.add_argument('--version', action='store_true', help='显示版本号')
    parser.add_argument('--verbose', '-v', action='store_true', help='显示详细信息')

    subparsers = parser.add_subparsers(dest='command', help='子命令')

    for cmd in COMMANDS.values():
        sub = subparsers.add_parser(cmd.name, help=cmd.help)
        cmd.setup_parser(sub)

    args = parser.parse_args()

    if args.version:
        from . import __version__
        print(f"ppc version {__version__}")
        return 0

    if args.command:
        cmd = COMMANDS[args.command]
        return cmd.run(args)

    parser.print_help()
    return 0


if __name__ == '__main__':
    sys.exit(main())
