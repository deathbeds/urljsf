"""Sphinx documentation configuration for ``prjsf``."""

# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.
import json
import sys
from pathlib import Path

import tomllib
from jinja2 import Template

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

#: this is used in an example in `demos/python.md`
PY_SCHEMA = {
    "type": "object",
    "required": ["favorite"],
    "properties": {
        "favorite": {
            "title": "favorite python module",
            "description": "pick a module",
            "type": "string",
            "enum": sorted(
                {m.split(".")[0] for m in sys.modules}, key=lambda x: x.lower()
            ),
        },
    },
}
