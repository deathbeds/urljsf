"""Main application for ``prjsf``."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

import shutil
from logging import Logger, getLogger
from pathlib import Path
from typing import Any

import jinja2

from .config import Config
from .constants import STATIC, TEMPLATES, __dist__


class Prjsf:
    """Main class for ``prjsf``."""

    config: Config | None = None
    log: Logger
    env: jinja2.Environment

    def __init__(self, config: Config) -> None:
        """Initialize a prjsf."""
        self.log = getLogger(__dist__)
        self.config = config
        self.log.setLevel(self.config.log_level)
        self.log.debug("prjsf config: %s", self.config)
        self.init_env()

    def init_env(self):
        loader = jinja2.FileSystemLoader(
            searchpath=[TEMPLATES, *self.config.extra_template_paths],
        )
        self.env = jinja2.Environment(
            loader=loader, undefined=jinja2.StrictUndefined, autoescape=True
        )

    def run_cli(self) -> int:
        """Generate output."""
        cfg = self.config
        self.log.debug("config: %s", cfg)
        rendered = self.render()
        cfg.output_dir.mkdir(parents=True, exist_ok=True)
        out_html = cfg.output_dir / cfg.html_filename
        out_html.write_text(rendered, encoding="utf-8")
        self.deploy_form_files(cfg.output_dir)
        self.deploy_static(cfg.output_dir / "_static")
        return 0

    def deploy_form_files(self, path: Path) -> None:
        cfg = self.config

        if not path.exists():
            path.mkdir(parents=True)

        for in_file in [cfg.schema, cfg.ui_schema, cfg.data]:
            if in_file is None:
                continue
            out_file = path / in_file.name
            out_file.write_bytes(cfg.schema.read_bytes())

    def render(self) -> str:
        cfg = self.config
        self.log.debug("rendering: %s", cfg)
        tmpl = self.env.get_template(cfg.template)
        return tmpl.render(**cfg.__dict__)

    @staticmethod
    def deploy_static(path: Path) -> None:
        """Copy the static assets into the right place."""
        if not path.parent.exists():
            path.parent.mkdir(exist_ok=True)
        if path.exists():
            shutil.rmtree(path)
        shutil.copytree(STATIC, path)

    def get_cli_context(self) -> dict[str, Any]:
        """Get the rendering context."""
        return {"title": self.config.title}
