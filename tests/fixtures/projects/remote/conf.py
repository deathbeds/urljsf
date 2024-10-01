"""A simple sphinx project."""

# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.
import sys
from pathlib import Path

sys.path += [str(Path(__file__).parent)]

extensions = ["prjsf.sphinxext"]
prjsf = {"css": {"add_bootstrap": True}}


def get_schema_url() -> str:
    """Get a schema URL."""
    return "https://example.com/complex-object.schema.json"
