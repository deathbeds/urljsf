"""Configuration for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any, Callable

from ._schema import FileFormat
from ._schema import Urljsf as UrljsfSchema
from .constants import UTF8
from .schema import URLJSF_VALIDATOR

if TYPE_CHECKING:
    from pathlib import Path

    from jsonschema import Draft7Validator


@dataclass
class DataSource:
    """Parsed data from a source."""

    path: Path
    raw: dict[str, Any] | None = None
    format: FileFormat | None = None

    def __post_init__(self) -> None:
        """Trigger parsing."""
        self.parse()

    def parse(self) -> None:
        """Parse a path."""
        suffix = self.path.suffix
        text = self.path.read_text(**UTF8)
        if suffix == ".toml":
            try:
                import tomllib
            except ImportError:
                import tomli as tomllib  # type: ignore[no-redef]

            self.raw = tomllib.loads(text)
            self.format = "toml"
        elif suffix in {".yaml", ".yml"}:
            from ruamel.yaml import YAML

            self.raw = YAML(typ="safe").load(text)
            self.format = "yaml"
        elif suffix == ".json":
            self.raw = json.loads(text)
            self.format = "json"
        else:
            msg = f"Can't parse {self.path}"
            raise NotImplementedError(msg)


@dataclass
class ValidatedSource(DataSource):
    """A validated source."""

    validator: Draft7Validator | None = None
    validation_errors: list[Any] | None = None
    as_type: Callable[..., Any] = field(default_factory=lambda: lambda: dict)
    data: Any | None = None

    def parse(self) -> None:
        """Validate, and attempt to parse the data."""
        super().parse()
        if not self.validator:  # pragma: no cover
            msg = f"No validator for {self.__class__.__name__}"
            raise NotImplementedError(msg)
        if self.raw is None:  # pragma: no cover
            msg = f"No data for {self.__class__.__name__}"
            raise NotImplementedError(msg)
        self.validation_errors = [*self.validator.iter_errors(self.raw)]
        self.data = self.as_type(**self.raw)


@dataclass
class DefSource(ValidatedSource):
    """A validated ``urljsf`` definition."""

    data: UrljsfSchema | None = None
    as_type: Callable[..., UrljsfSchema] = field(default_factory=lambda: UrljsfSchema)
    validator: Draft7Validator = field(default_factory=lambda: URLJSF_VALIDATOR)
