"""Configuration for ``urljsf``."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from .constants import UTF8

if TYPE_CHECKING:
    from pathlib import Path


@dataclass
class DataSource:
    """Parsed data from a source."""

    path: Path
    data: dict[str, Any] | None = None

    def __post_init__(self) -> None:
        self.data = self.parse(self.path)

    @staticmethod
    def parse(path: Path) -> dict[str, Any]:
        """Parse a path."""
        suffix = path.suffix
        text = path.read_text(**UTF8)
        if suffix == ".toml":
            import tomllib

            return tomllib.loads(text)
        if suffix in [".yaml", ".yml"]:
            import ruamel.yaml

            return ruamel.yaml.YAML(typ="safe").load(text)
        if suffix == ".json":
            import json

            return json.loads(text)
        msg = f"Can't parse {path}"
        raise NotImplementedError(msg)
