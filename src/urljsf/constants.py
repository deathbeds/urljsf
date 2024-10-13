"""Constants for ``urljsf``."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
from pathlib import Path

__dist__ = "urljsf"
__version__ = f"""{__import__("importlib.metadata").metadata.version(__dist__)}"""

UTF8 = {"encoding": "utf-8"}

HERE = Path(__file__).parent
TEMPLATES = HERE / "_templates"
STATIC = HERE / "_static"

SCHEMA_VERSION = "v0"
MIME_PREFIX = f"application/vnd.deathbeds.prjsf.{SCHEMA_VERSION}"
