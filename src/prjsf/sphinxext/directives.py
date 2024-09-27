"""Directives for ``prjsf.sphinxext``."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import os
from pathlib import Path
from typing import ClassVar

from docutils import nodes
from docutils.parsers.rst import directives
from sphinx.util.docutils import SphinxDirective

from ..config import Config
from ..constants import TFORMATS
from ..prjsf import Prjsf


def a_format(argument: str) -> str:
    """Conversion function for the ``*-format`` options."""
    return directives.choice(argument, TFORMATS)


def a_boolish(argument: str) -> str:
    """Conversion function for ."""
    return directives.choice(argument.lower(), ["true", "false"])


class PrForm(SphinxDirective):
    """Class for the ``pr-form`` directive."""

    optional_arguments = 1
    has_content = True
    option_spec: ClassVar = {
        "github-url": directives.uri,
        "github-repo": directives.uri,
        "github-branch": directives.unchanged,
        "schema": directives.path,
        "py-schema": directives.unchanged,
        "schema-format": a_format,
        "ui-schema": directives.path,
        "py-ui-schema": directives.unchanged,
        "ui-schema-format": a_format,
        "data": directives.path,
        "py-data": directives.unchanged,
        "data-format": a_format,
        "id-prefix": directives.unchanged,
        "filename": directives.uri,
        "prune-empty": a_boolish,
    }
    _prsjf: Prjsf | None

    def run(self) -> list[nodes.Node]:
        """Generate a single RJSF form."""
        self._prjsf = Prjsf(self._options_to_config())
        attrs = {"class": "prsf"}
        self._prjsf.deploy_form_files(
            Path(self.env.app.builder.outdir) / "_static/pr-form"
        )
        return [nodes.raw("", self._prjsf.render(), format="html", **attrs)]

    def _options_to_config(self) -> Config:
        """Convert ``sphinx-options`` to ``prjsf_options``."""
        cfg = self.env.config.__dict__["prjsf"].get

        if self.arguments:
            self.options["github-repo"] = self.arguments[0]

        here = Path(self.state.document.current_source).parent
        rel = os.path.relpath(self.env.app.srcdir, here)
        url_base = f"{rel}/_static/pr-form/"

        schema = self.options.get("schema")
        data = self.options.get("data")
        ui_schema = self.options.get("ui-schema")

        return Config(
            # meta
            template="prjsf/sphinx.j2",
            url_base=url_base,
            id_prefix=self.options.get("id-prefix"),
            # required
            github_repo=self.options.get("github-repo", cfg("github_repo")),
            schema=(here / schema) if schema else None,
            py_schema=self.options.get("py-schema"),
            # optional
            github_branch=self.options.get("github-branch", cfg("github_branch")),
            github_url=self.options.get("github-url", cfg("github_url")),
            schema_format=self.options.get("schema-format"),
            pr_filename=self.options.get("filename"),
            data=(here / data) if data else data,
            py_data=self.options.get("py-data"),
            data_format=self.options.get("data-format"),
            ui_schema=(here / ui_schema) if ui_schema else ui_schema,
            py_ui_schema=self.options.get("py-ui-schema"),
            ui_schema_format=self.options.get("ui-schema-format"),
            prune_empty=self.options.get("prune-empty", cfg("prune_empty")),
        )
