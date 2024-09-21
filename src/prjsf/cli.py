"""Standalone CLI for building simple PR forms.

For more complex use cases, please use ``prjsf.sphinx``.
"""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import sys
from argparse import ArgumentParser
from pathlib import Path

from .config import Config
from .constants import __dist__, __version__


def get_parser() -> ArgumentParser:
    """Get a parser for the command line arguments."""
    parser = ArgumentParser(__dist__)
    parser.add_argument("--version", action="version", version=__version__)
    parser.add_argument(
        "-s", "--schema", type=Path, help="path to a JSON Schema as a .json file"
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="path to folder file to generate",
        default=Path("_prjsf"),
    )
    parser.add_argument(
        "-h", "--html", help="name of a file to generate", default="index.html"
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    """Run the command line interface."""
    parser = get_parser()
    config = Config(**vars(parser.parse_args(argv)))
    sys.stderr.write(f"{config}")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
