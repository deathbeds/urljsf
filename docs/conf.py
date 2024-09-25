"""Sphinx documentation configuration for ``prjsf``."""

# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.
import json
from pathlib import Path

import tomllib
from jinja2 import Template

HERE = Path(__file__).parent
ROOT = HERE.parent
PXT = ROOT / "pixi.toml"
PPT = ROOT / "pyproject.toml"
PXTD = tomllib.loads(PXT.read_text(encoding="utf-8"))
PPTD = tomllib.loads(PPT.read_text(encoding="utf-8"))
SPX = json.loads(
    Template(json.dumps(PXTD["tool"]["sphinx"])).render(pxt=PXTD, ppt=PPTD)
)

globals().update(SPX)
