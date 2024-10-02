"""Directives for ``prjsf.sphinxext``."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import os
from pathlib import Path
from typing import TYPE_CHECKING, ClassVar

from docutils.parsers.rst.directives import choice, path, unchanged, uri
from sphinx.util.docutils import SphinxDirective

from ..config import Config
from ..constants import TFORMATS, THEMES
from ..prjsf import Prjsf
from .nodes import prform

if TYPE_CHECKING:
    from docutils import nodes


def a_format(argument: str) -> str:
    """Conversion function for the ``*-format`` options."""
    return choice(argument, TFORMATS)


def a_boolish(argument: str) -> str:
    """Conversion function for ."""
    return choice(argument.lower(), ["true", "false"])


def a_theme(argument: str) -> str:
    """Conversion function for ."""
    return choice(argument.lower(), THEMES)


class PrForm(SphinxDirective):
    """Class for the ``pr-form`` directive."""

    optional_arguments = 1
    has_content = True
    option_spec: ClassVar = {
        "github-url": uri,
        "github-repo": uri,
        "github-branch": unchanged,
        "schema": path,
        "py-schema": unchanged,
        "schema-format": a_format,
        "ui-schema": path,
        "py-ui-schema": unchanged,
        "ui-schema-format": a_format,
        "data": path,
        "py-data": unchanged,
        "data-format": a_format,
        "id-prefix": unchanged,
        "filename": uri,
        "filename-pattern": unchanged,
        "prune-empty": a_boolish,
        "iframe": a_boolish,
        "iframe-style": unchanged,
        "theme": a_theme,
    }
    _prsjf: Prjsf | None

    def run(self) -> list[nodes.Node]:
        """Generate a single RJSF form."""
        config = self._options_to_config()
        self._prjsf = Prjsf(config)
        self._prjsf.deploy_form_files(
            Path(self.env.app.builder.outdir) / "_static/pr-form"
        )
        return [prform("", self._prjsf.render())]

    def _options_to_config(self) -> Config:
        """Convert ``sphinx-options`` to ``prjsf_options``."""
        cfg = self.env.config.__dict__["prjsf"].get
        opt = self.options.get

        if self.arguments:
            self.options["github-repo"] = self.arguments[0]

        here = Path(self.state.document.current_source).parent
        rel = os.path.relpath(self.env.app.srcdir, here)

        def to_abs_or_url(url_or_path: str | None) -> str | None:
            """Resolve a path to a config value."""
            if url_or_path is None:
                resolved = None
            elif Prjsf.is_url(url_or_path):
                resolved = url_or_path
            else:
                resolved = str(here / url_or_path)
            return resolved

        schema = to_abs_or_url(opt("schema"))
        data = to_abs_or_url(opt("data"))
        ui_schema = to_abs_or_url(opt("ui-schema"))

        return Config(
            # meta
            template="prjsf/sphinx.j2",
            url_base=f"{rel}/_static/pr-form/",
            id_prefix=opt("id-prefix"),
            # required
            github_repo=opt("github-repo", cfg("github_repo")),
            py_schema=opt("py-schema"),
            # paths
            schema=schema,
            data=data,
            ui_schema=ui_schema,
            # iframe
            theme=opt("theme", cfg("theme")),
            iframe=opt("iframe", cfg("iframe")),
            iframe_style=opt("iframe_style", cfg("iframe_style")),
            # other optional
            github_branch=opt("github-branch", cfg("github_branch")),
            github_url=opt("github-url", cfg("github_url")),
            schema_format=opt("schema-format"),
            pr_filename=opt("filename"),
            pr_filename_pattern=opt("filename-pattern"),
            py_data=opt("py-data"),
            data_format=opt("data-format"),
            py_ui_schema=opt("py-ui-schema"),
            ui_schema_format=opt("ui-schema-format"),
            prune_empty=opt("prune-empty", cfg("prune_empty")),
        )
