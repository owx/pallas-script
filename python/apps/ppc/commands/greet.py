import argparse
from .base import BaseCommand


class GreetCommand(BaseCommand):
    name = 'greet'
    help = '打招呼'

    def setup_parser(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument('--name', default='World', help='名字')
        parser.add_argument('--count', type=int, default=1, help='重复次数')

    def run(self, args: argparse.Namespace) -> int:
        for _ in range(args.count):
            print(f"Hello, {args.name}!")
        return 0
