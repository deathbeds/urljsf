"""A sphinx extension for ``prjsf``."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Any

from ..constants import UTF8, __version__
from ..prjsf import Prjsf
from .directives import PrForm, prform

if TYPE_CHECKING:
    from sphinx.application import Sphinx

SPHINX_EXT_INFO = {
    "parallel_read_safe": True,
    "parallel_write_safe": True,
    "version": __version__,
}

DEFAULT_SCOPES = [
    ".prjsf-pr-form",
    ".prjsf-pr-form .list-group",
    ".prjsf-pr-form .card",
]


def build_finished(app: Sphinx, _err: Exception | None) -> None:
    """Copy all static assets.

    Should only deploy bootstrap if asked.
    """
    conf = app.config["prjsf"].get
    static = Path(app.builder.outdir) / "_static/prjsf"

    Prjsf.deploy_static(Path(app.builder.outdir) / static)

    css = conf("css")
    if css:
        css_path = static / "variables.css"
        scopes = css.get("scopes", DEFAULT_SCOPES)
        rules = [
            f"  --{k}: var(--{v}) !important;"
            for k, v in sorted(css["variables"].items())
        ]
        css_path.write_text(
            "\n".join([f"""{", ".join(scopes)} {{""", *rules, "}", ""]), **UTF8
        )


def html_page_context(
    app: Sphinx, pagename: str, templatename: str, context: dict, doctree: Any
) -> None:
    """Add JS/CSS to the page."""
    if not doctree or not doctree.traverse(prform):
        return

    app.add_js_file("prjsf/prjsf/prjsf.js", type="module")
    conf = app.config["prjsf"].get
    if conf("add_bootstrap_css"):
        app.add_css_file("prjsf/vendor/bootstrap/dist/css/bootstrap.min.css")

    css = conf("css")
    if css:
        app.add_css_file("prjsf/variables.css")


def setup(app: Sphinx) -> dict[str, Any]:
    """Set up the sphinx extension."""
    app.add_directive("pr-form", PrForm)
    app.add_config_value(
        "prjsf", {}, "env", description="``prjsf`` configuration values"
    )
    app.connect("build-finished", build_finished)
    app.connect("html-page-context", html_page_context)

    return SPHINX_EXT_INFO
