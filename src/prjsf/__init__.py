"""Build structured data files for pull requests with JSON schema."""
# Copyright (C) prjsf contributors.

from .constants import __version__
from .prjsf import Prjsf

__all__ = ["Prjsf", "__version__"]
