"""Configuration for ``prjsf``."""

# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .constants import TFormat


@dataclass
class Config:
    """Configuration for ``prjsf``."""

    # required
    github_url: str
    schema: Path
    # app
    log_level: str = "DEBUG"
    # meta
    url_base: str = "./"
    # end up as data- attributes
    schema_format: TFormat | None = None
    id_prefix: str | None = None
    pr_filename: str = "data.json"
    data_format: TFormat | None = None
    data: Path | None = None
    ui_schema: Path | None = None
    ui_schema_format: TFormat | None = None
    # cli
    html_filename: str = "index.html"
    html_title: str | None = None
    output_dir: Path = Path("_prjsf_output")
    template: str = "prjsf/standalone.j2"
    extra_template_paths: list[Path] = field(default_factory=list)


DEFAULTS = {fn: f.default for fn, f in Config.__dataclass_fields__.items()}
