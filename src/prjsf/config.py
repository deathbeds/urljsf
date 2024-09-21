"""Configuration for ``prjsf``."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from dataclasses import dataclass
from pathlib import Path


@dataclass
class Config:
    """Configuration for ``prjsf``."""

    schema: Path
    output: Path
