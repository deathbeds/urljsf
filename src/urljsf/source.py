"""Configuration for ``urljsf``."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from ._schema import FileFormat
from ._schema import Urljsf as UrljsfSchema
from .constants import UTF8
from .schema import URLJSF_VALIDATOR

if TYPE_CHECKING:
    from pathlib import Path

    from jsonschema.protocols import Validator


@dataclass
class DataSource:
    """Parsed data from a source."""

    path: Path
    raw: dict[str, Any] | None = None
    format: FileFormat | None = None

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

            self.raw = tomllib.loads(text)
            self.format = "toml"
        elif suffix in {".yaml", ".yml"}:
            from ruamel.yaml import YAML

            self.raw = YAML(typ="safe").load(text)
            self.format = "yaml"
        elif suffix == ".json":
            import json

            self.raw = json.loads(text)
            self.format = "json"
        else:
            msg = f"Can't parse {self.path}"
            raise NotImplementedError(msg)


@dataclass
class ValidatedSource(DataSource):
    validator: Validator | None = None
    validation_errors: list[Any] | None = None
    as_type: type = field(default_factory=lambda: dict)
    data: dict[str, Any] = None

    def __post_init__(self) -> None:
        super().__post_init__()
        self.validation_errors = [*self.validator.iter_errors(self.raw)]
        self.data = self.as_type(**self.raw)


@dataclass
class DefSource(ValidatedSource):
    data: UrljsfSchema | None = None
    as_type: type[UrljsfSchema] = field(default_factory=UrljsfSchema)
    validator: Validator = field(default_factory=lambda: URLJSF_VALIDATOR)
