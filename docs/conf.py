"""Sphinx documentation configuration for ``urljsf``."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import TYPE_CHECKING, Any

import tomllib
from jinja2 import Template
from myst_parser.parsers.mdit import create_md_parser
from myst_parser.parsers.sphinx_ import SphinxRenderer

if TYPE_CHECKING:
    from docutils import nodes
    from myst_parser.parsers.sphinx_ import MdParserConfig
    from sphinx.application import Sphinx

sys.path += [str(Path(__file__).parent)]

UTF8 = {"encoding": "utf-8"}
HERE = Path(__file__).parent
ROOT = HERE.parent
PXT = ROOT / "pixi.toml"
PPT = ROOT / "pyproject.toml"
PXTD = tomllib.loads(PXT.read_text(**UTF8))
PPTD = tomllib.loads(PPT.read_text(**UTF8))
SPX = json.loads(
    Template(json.dumps(PXTD["tool"]["sphinx"])).render(pxt=PXTD, ppt=PPTD)
)

globals().update(SPX)


def setup(app: Sphinx) -> None:
    """Handle custom events before sphinx gets going."""

    def _get_description(self, schema: dict[str, Any], node: nodes.Node):
        """Hack markdown into (some) schema descriptions."""
        description = schema.pop("description", None)
        if not description:
            return

        # get the global config
        document = self.state.document
        config: MdParserConfig = document.settings.env.myst_config

        parser = create_md_parser(config, SphinxRenderer)
        children = [*document.children]
        parser.options["document"] = document
        note_substitution_def = document.note_substitution_def
        try:
            document.note_substitution_def = lambda *args: None
            parser.render(description)
        finally:
            document.note_substitution_def = note_substitution_def
        node.children = [*node.children, *document.children[len(children) :]]
        document.children = children

    WideFormat = __import__("sphinx-jsonschema.wide_format").wide_format.WideFormat
    WideFormat._get_description = _get_description
