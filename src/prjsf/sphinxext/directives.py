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


class PrForm(SphinxDirective):
    """Class for the ``pr-form`` directive."""

    optional_arguments = 1
    has_content = True
    option_spec: ClassVar = {
        "github-url": directives.uri,
        "schema": directives.path,
        "schema-format": a_format,
        "ui-schema": directives.path,
        "ui-schema-format": a_format,
        "data": directives.path,
        "data-format": a_format,
        "id-prefix": directives.unchanged,
        "filename": directives.uri,
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
        if self.arguments:
            self.options["github-url"] = self.arguments[0]

        here = Path(self.state.document.current_source).parent
        rel = os.path.relpath(self.env.app.srcdir, here)
        url_base = f"{rel}/_static/pr-form/"

        data = self.options.get("data")
        ui_schema = self.options.get("ui-schema")

        return Config(
            # meta
            template="prjsf/sphinx.j2",
            url_base=url_base,
            id_prefix=self.options.get("id-prefix"),
            # required
            github_url=self.options["github-url"],
            schema=here / self.options["schema"],
            # optional
            schema_format=self.options.get("schema-format"),
            pr_filename=self.options.get("filename"),
            data=(here / data) if data else data,
            data_format=self.options.get("data-format"),
            ui_schema=(here / ui_schema) if ui_schema else ui_schema,
            ui_schema_format=self.options.get("ui-schema-format"),
        )
