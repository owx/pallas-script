import argparse
from ..utils import calculate_stats
from .base import BaseCommand


class CalcCommand(BaseCommand):
    name = 'calc'
    help = '计算数字'

    def setup_parser(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument('numbers', type=float, nargs='+', help='要计算的数字')

    def run(self, args: argparse.Namespace) -> int:
        stats = calculate_stats(args.numbers)
        print(f"\n数字: {args.numbers}")
        print("=" * 40)
        print(f"总和: {stats['sum']}")
        print(f"平均值: {stats['mean']:.2f}")
        print(f"最大值: {stats['max']}")
        print(f"最小值: {stats['min']}")
        print(f"计数: {stats['count']}")
        return 0
