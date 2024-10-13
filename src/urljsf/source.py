"""Configuration for ``urljsf``."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from ._schema.form_schema import AnyFileFormat, Urljsf
from .constants import UTF8
from .schema import URLJSF_VALIDATOR

if TYPE_CHECKING:
    from pathlib import Path


@dataclass
class DataSource:
    """Parsed data from a source."""

    path: Path
    data: Any | None = None
    format: AnyFileFormat | None = None
    validation_errors: list[Any] | None = None

    def __post_init__(self) -> None:
        self.parse()

    def parse(self) -> None:
        """Parse a path."""
        suffix = self.path.suffix
        text = self.path.read_text(**UTF8)
        if suffix == ".toml":
            try:
                import tomllib
            except ImportError:
                import tomli as tomllib

            self.data = tomllib.loads(text)
            self.format = "toml"
        elif suffix in [".yaml", ".yml"]:
            from ruamel.yaml import YAML

            self.data = YAML(typ="safe").load(text)
            self.format = "yaml"
        elif suffix == ".json":
            import json

            self.data = json.loads(text)
            self.format = "json"
        else:
            msg = f"Can't parse {self.path}"
            raise NotImplementedError(msg)


@dataclass
class DefSource(DataSource):
    data: Urljsf | None = None

    def __post_init__(self) -> None:
        super().__post_init__()
        self.validation_errors = [*URLJSF_VALIDATOR.iter_errors(self.data)]
