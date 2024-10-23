"""Sphinx documentation configuration for ``urljsf``."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import TYPE_CHECKING, Any

import pypandoc
import tomllib
from jinja2 import Template

if TYPE_CHECKING:
    from docutils import nodes
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
    """Handle custom events before sphinx starts."""

    def _md_description(self, schema: dict[str, Any], node: nodes.Node):
        """Convert a (simple) markdown description to (simple) rst."""
        description = schema.pop("description", None)
        if not description:
            return

        rst = pypandoc.convert_text(description, "rst", format="md")
        if isinstance(node, list):
            node.append(self._line(self._cell(rst)))
        else:
            self.state.nested_parse(self._convert_content(rst), self.lineno, node)

    wf_cls = __import__("sphinx-jsonschema.wide_format").wide_format.WideFormat
    wf_cls._get_description = _md_description
    wf_cls._check_description = _md_description
