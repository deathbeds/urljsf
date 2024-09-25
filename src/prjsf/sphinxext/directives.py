"""Directives for ``prjsf.sphinxext``."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import os
import pprint
from pathlib import Path

from docutils import nodes
from docutils.parsers.rst import directives
from sphinx.util.docutils import SphinxDirective

from ..config import Config
from ..constants import TFORMATS
from ..prjsf import Prjsf


def a_format(argument: str):
    """Conversion function for the "align" option."""
    return directives.choice(argument, TFORMATS)


class PrForm(SphinxDirective):
    """Class for the ``pr-form`` directive."""

    optional_arguments = 1
    has_content = True
    option_spec = {
        "github-url": directives.uri,
        "schema": directives.path,
        "schema-format": a_format,
        "ui-schema": directives.path,
        "ui-schema-format": a_format,
        "data": directives.path,
        "data-format": a_format,
    }
    _prsjf: Prjsf | None

    def run(self) -> list[nodes.Node]:
        """Generate a single RJSF form."""
        self._prjsf = Prjsf(self._options_to_config())
        self._prjsf.log.error(
            "\n%s\n",
            pprint.pformat({"doc": sorted(self.state.document.__dict__.items())}),
        )
        self._prjsf.log.error(
            "\n%s\n",
            pprint.pformat({"env": sorted(self.env.app.builder.__dict__.items())}),
        )
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

        return Config(
            template="prjsf/sphinx.j2",
            schema=Path(here / self.options["schema"]),
            github_url=self.options["github-url"],
            url_base=url_base,
        )
