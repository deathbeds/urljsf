"""Main application for ``urljsf``."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

import hashlib
import json
import re
from logging import Logger, getLogger
from pathlib import Path
from typing import TYPE_CHECKING, Any

import jinja2

from .constants import STATIC, TEMPLATES, __dist__

if TYPE_CHECKING:
    from .config import Config


class Urljsf:
    """Main class for ``urljsf``."""

    config: Config
    log: Logger
    env: jinja2.Environment

    def __init__(self, config: Config) -> None:
        """Initialize a urljsf."""
        self.log = getLogger(__dist__)
        self.config = config
        self.log.setLevel(self.config.log_level)
        self.log.debug("urljsf config: %s", self.config)
        self.init_env()

    def init_env(self) -> None:
        """Prepare a jinja environment."""
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
        self.deploy_form_files(cfg.output_dir)
        # rendered = self.render()
        # cfg.output_dir.mkdir(parents=True, exist_ok=True)
        # out_html = cfg.output_dir / cfg.html_filename
        # out_html.write_text(rendered, encoding="utf-8")
        # self.deploy_static(cfg.output_dir / "_static")
        print("OH NO")
        return 1

    def deploy_form_files(self, path: Path) -> None:
        """Copy the schema, uiSchema, and data files."""
        cfg = self.config
        raise NotImplementedError("not deploying yet")

    def from_file_or_py(
        self,
        static_path: Path,
        file_name: str | None,
        dotted: str | None,
    ) -> str | None:
        """Resolve a source file or dotted python import to a static file."""
        if dotted:
            name, raw = self.import_dotted(dotted)
            if isinstance(raw, str):
                resolved = raw
            elif isinstance(raw, dict):
                in_bytes = json.dumps(raw, indent=2).encode("utf-8")
                resolved = self.write_hashed(in_bytes, name, static_path)
            else:  # pragma: no cover
                msg = f"cannot resolve import as URL string or schema object: {raw}"
                raise RuntimeError(msg)
        elif file_name is None:
            resolved = None
        elif self.is_url(file_name):
            resolved = file_name
        else:
            in_path = Path(file_name)
            in_bytes = in_path.read_bytes()
            resolved = self.write_hashed(in_bytes, in_path.name, static_path)
        return resolved

    @staticmethod
    def write_hashed(in_bytes: bytes, name: str, static_path: Path) -> str:
        """Write a file to disk with a hash-based cache buster."""
        shasum = hashlib.sha256(in_bytes).hexdigest()[:8]
        stem, ext = name.rsplit(".", 1)
        out_path = static_path / f"{stem}-{shasum}.{ext}"
        if not out_path.exists():
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(in_bytes)
        return out_path.name

    def render(self) -> str:
        """Render a template."""
        cfg = self.config
        self.log.debug("rendering: %s", cfg)
        tmpl = self.env.get_template(cfg.template)
        context = dict(cfg.__dict__)
        return tmpl.render(context)

    @staticmethod
    def deploy_static(path: Path) -> None:
        """Copy the static assets into the right place."""
        for child in STATIC.rglob("*"):
            if child.is_dir():
                continue
            rel = str(child.relative_to(STATIC))
            dest = path / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(child.read_bytes())

    def import_dotted(self, dotted: str) -> tuple[str, dict[str, Any] | str]:
        """Generate a JSON file from a dotted python import."""
        module_path, member = dotted.split(":")
        submodules = module_path.split(".")[1:]
        current = __import__(module_path)
        for sub in submodules:
            current = getattr(current, sub)
        final = getattr(current, member)
        if callable(final):
            final = final()
        return self.dotted_name(dotted), final

    @staticmethod
    def dotted_name(dotted: str) -> str:
        """Get a filename for a dotted import."""
        module_path, member = dotted.split(":")
        return f"{module_path}-{member}.json".lower()

    @staticmethod
    def is_url(value: str | Path | None) -> bool:
        """Get whether a value is a URL."""
        return bool(re.findall("^https?://", str(value)))
