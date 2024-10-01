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

    # required...
    github_repo: str
    # at least one of...
    schema: str | None = None
    py_schema: str | None = None
    # meta...
    url_base: str = "./"
    # end up as ``data-`` attributes..
    github_branch: str = "main"
    github_url: str = "https://github.com"
    schema_format: TFormat | None = None
    id_prefix: str | None = None
    pr_filename: str = "data.json"
    pr_filename_pattern: str | None = r"^[^/].*\.(json|yaml|yml|toml)$"
    data: str | None = None
    py_data: str | None = None
    data_format: TFormat | None = None
    ui_schema: str | None = None
    py_ui_schema: str | None = None
    ui_schema_format: TFormat | None = None
    prune_empty: bool = (True,)
    # cli...
    html_filename: str = "index.html"
    html_title: str | None = None
    output_dir: Path = Path("./_prjsf_output")
    template: str = "prjsf/standalone.j2"
    extra_template_paths: list[Path] = field(default_factory=list)
    # app...
    log_level: str = "DEBUG"
    # more?


DEFAULTS = {fn: f.default for fn, f in Config.__dataclass_fields__.items()}
