from .greet import GreetCommand
from .info import InfoCommand
from .calc import CalcCommand

COMMANDS: dict[str, 'BaseCommand'] = {
    'greet': GreetCommand(),
    'info': InfoCommand(),
    'calc': CalcCommand(),
}

from .base import BaseCommand
