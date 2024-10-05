"""Constants for ``urljsf``."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
from pathlib import Path
from typing import Literal

__dist__ = "urljsf"
__version__ = f"""{__import__("importlib.metadata").metadata.version(__dist__)}"""

UTF8 = {"encoding": "utf-8"}

HERE = Path(__file__).parent
TEMPLATES = HERE / "_templates"
STATIC = HERE / "_static"


TFormat = Literal["json", "toml", "yaml"]
TFORMATS: list[TFormat] = "json", "toml", "yaml"

THEMES = [
    "bootstrap",
    # custom themes
    "cerulean",
    "cosmo",
    "cyborg",
    "darkly",
    "flatly",
    "journal",
    "litera",
    "lumen",
    "lux",
    "materia",
    "minty",
    "morph",
    "pulse",
    "quartz",
    "sandstone",
    "simplex",
    "sketchy",
    "slate",
    "solar",
    "spacelab",
    "superhero",
    "united",
    "vapor",
    "yeti",
    "zephyr",
]
