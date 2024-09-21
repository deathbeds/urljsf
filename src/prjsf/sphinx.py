"""A sphinx extension for ``prjsf``."""
# Copyright (C) prjsf contributors.

from typing import Any

from docutils.parsers.rst import Directive, DirectiveError
from sphinx.application import Sphinx

from .constants import __dist__, __version__


class PrjsfDirective(Directive):
    """A docutils directive for rjsf forms."""

    optional_arguments = 1
    has_content = True
    option_spec = {}

    def run(self) -> Any:
        """Generate a single RJSF form."""
        msg = f"TODO: {self}"
        raise DirectiveError(msg)


def setup(app: Sphinx) -> dict[str, Any]:
    """Set up the sphinx extension."""
    app.add_directive(__dist__, PrjsfDirective)
    app.add_config_value(__dist__, {}, "env")
    return {"parallel_read_safe": True, "version": __version__}
