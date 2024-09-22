"""Main application for ``prjsf``."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

import shutil
from logging import Logger, getLogger
from typing import Any

import jinja2

from .config import Config
from .constants import STATIC, TEMPLATES, __dist__


class Prjsf:
    """Main class for ``prjsf``."""

    config: Config
    log: Logger

    def __init__(self, config: Config) -> None:
        """Initialize a prjsf."""
        self.config = config
        self.log = getLogger(__dist__)
        self.log.setLevel(self.config.log_level)
        self.log.debug("prjsf config: %s", self.config)

    def run_cli(self) -> int:
        """Generate output."""
        cfg = self.config
        self.log.debug("config: %s", cfg)

        loader = jinja2.FileSystemLoader(
            searchpath=[TEMPLATES, *self.config.extra_template_paths],
        )
        env = jinja2.Environment(
            loader=loader, undefined=jinja2.StrictUndefined, autoescape=True
        )

        tmpl = env.get_template(cfg.template)
        rendered = tmpl.render(**cfg.__dict__)
        cfg.output_dir.mkdir(parents=True, exist_ok=True)
        out_html = cfg.output_dir / cfg.html_filename
        out_html.write_text(rendered, encoding="utf-8")
        static = cfg.output_dir / "_static"

        for in_file in [cfg.schema, cfg.ui_schema, cfg.data]:
            if in_file is None:
                continue
            out_file = cfg.output_dir / in_file.name
            out_file.write_bytes(cfg.schema.read_bytes())

        if static.exists():
            shutil.rmtree(static)
        shutil.copytree(STATIC, static)
        return 0

    def get_cli_context(self) -> dict[str, Any]:
        """Get the rendering context."""
        return {"title": self.config.title}
