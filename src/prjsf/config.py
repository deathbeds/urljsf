"""Configuration for ``prjsf``."""

# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from .constants import TFormat


@dataclass
class Config:
    """Configuration for ``prjsf``."""

    schema: Path
    github_url: str
    pr_filename: str = "data.json"
    html_filename: str = "index.html"
    html_title: str | None = None
    schema_format: TFormat | None = None
    url_base: str = "./"
    output_dir: Path = Path("_prjsf_output")
    filename: str = "index.html"
    template: str = "prjsf/standalone.j2"
    extra_template_paths: list[Path] = field(default_factory=list)
    data_format: TFormat | None = None
    data: Path | None = None
    ui_schema: Path | None = None
    ui_schema_format: TFormat | None = None
    log_level: str = "DEBUG"


DEFAULTS = {fn: f.default for fn, f in Config.__dataclass_fields__.items()}
