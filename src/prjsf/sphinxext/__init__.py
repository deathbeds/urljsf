"""A sphinx extension for ``prjsf``."""

# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

from typing import TYPE_CHECKING

from ..constants import __version__
from .directives import GitHubPR
from .extension import build_finished, html_page_context

if TYPE_CHECKING:
    from sphinx.application import Sphinx
    from sphinx.util.typing import ExtensionMetadata


def setup(app: Sphinx) -> ExtensionMetadata:
    """Set up the sphinx extension."""
    app.add_directive("github-pr", GitHubPR)
    app.add_config_value(
        "prjsf", {}, "env", description="``prjsf`` configuration values"
    )
    app.connect("build-finished", build_finished)
    app.connect("html-page-context", html_page_context)

    return {
        "parallel_read_safe": True,
        "parallel_write_safe": True,
        "version": __version__,
    }
