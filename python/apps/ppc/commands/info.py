import argparse
from ..utils import get_system_info
from .base import BaseCommand


class InfoCommand(BaseCommand):
    name = 'info'
    help = '显示系统信息'

    def run(self, args: argparse.Namespace) -> int:
        info = get_system_info()
        print("\n系统信息:")
        print("=" * 40)
        for key, value in info.items():
            print(f"{key:20}: {value}")
        return 0
