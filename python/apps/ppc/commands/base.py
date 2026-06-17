import argparse


class BaseCommand:
    name: str = ''
    help: str = ''

    def setup_parser(self, parser: argparse.ArgumentParser) -> None:
        pass

    def run(self, args: argparse.Namespace) -> int:
        raise NotImplementedError
