"""Constants for ``prjsf``."""

# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.
from pathlib import Path
from typing import Literal

__dist__ = "prjsf"
__version__ = f"""{__import__("importlib.metadata").metadata.version(__dist__)}"""

HERE = Path(__file__).parent
TEMPLATES = HERE / "_templates"
STATIC = HERE / "_static"


TFormat = Literal["json", "toml", "yaml"]
TFORMATS: list[TFormat] = "json", "toml", "yaml"
