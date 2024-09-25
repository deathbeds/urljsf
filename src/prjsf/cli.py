"""Standalone CLI for building simple PR forms.

For more complex use cases, please use ``prjsf.sphinxext``.
"""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from argparse import ArgumentParser
from pathlib import Path

from .config import DEFAULTS, Config
from .constants import __dist__, __version__
from .prjsf import Prjsf


def get_parser() -> ArgumentParser:
    """Get a parser for the command line arguments."""
    parser = ArgumentParser(__dist__, add_help=False)
    parser.add_argument("-s", "--schema", type=Path, help="path to a JSON Schema")
    parser.add_argument("-g", "--github-url", help="the full branch URL to target")
    parser.add_argument(
        "-p",
        "--py-schema",
        help="a python.module:member to use as a schema, e.g. foo.bar:baz",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        type=Path,
        help="path to a folder to generate",
        default=DEFAULTS["output_dir"],
    )
    parser.add_argument(
        "-h",
        "--html-filename",
        help="name of an HTML file to generate",
        default=DEFAULTS["html_filename"],
    )
    parser.add_argument(
        "-t",
        "--template",
        help="name of the template to use",
        default=DEFAULTS["template"],
    )
    parser.add_argument(
        "--html-title",
        help="title",
    )
    parser.add_argument("--help", action="help", help="show program's usage and exit")
    parser.add_argument("--version", action="version", version=__version__)
    return parser


def main(argv: list[str] | None = None) -> int:
    """Run the command line interface."""
    parser = get_parser()
    config = Config(**vars(parser.parse_args(argv)))
    prjsf = Prjsf(config)
    return prjsf.run_cli()
