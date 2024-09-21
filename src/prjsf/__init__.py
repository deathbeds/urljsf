"""Build structured data files for pull requests with JSON schema."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from .constants import __version__
from .prjsf import Prjsf

__all__ = ["Prjsf", "__version__"]
