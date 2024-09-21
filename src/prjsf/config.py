"""Configuration for ``prjsf``."""
# Copyright (C) prjsf contributors.

from dataclasses import dataclass
from pathlib import Path


@dataclass
class Config:
    """Configuration for ``prjsf``."""

    schema: Path
    output: Path
