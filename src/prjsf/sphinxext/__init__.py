"""A sphinx extension for ``prjsf``."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Any

from ..constants import __version__
from ..prjsf import Prjsf
from .directives import PrForm

if TYPE_CHECKING:
    from sphinx.application import Sphinx

SPHINX_EXT_INFO = {
    "parallel_read_safe": True,
    "parallel_write_safe": True,
    "version": __version__,
}


def deploy_static(app: Sphinx, _err: Exception | None) -> None:
    Prjsf.deploy_static(Path(app.builder.outdir) / "_static/prjsf")


def add_to_page(
    app: Sphinx, pagename: str, templatename: str, context: dict, event_arg: Any
) -> None:
    app.add_js_file("prjsf/prjsf/prjsf.js", type="module")
    ext_config = app.config["prjsf"]
    if ext_config.get("add_bootstrap_css"):
        app.add_css_file("prjsf/vendor/bootstrap/dist/css/bootstrap.min.css")


def setup(app: Sphinx) -> dict[str, Any]:
    """Set up the sphinx extension."""
    app.add_directive("pr-form", PrForm)
    app.add_config_value("prjsf", {}, "env")

    app.connect("build-finished", deploy_static)
    app.connect("html-page-context", add_to_page)

    return SPHINX_EXT_INFO
