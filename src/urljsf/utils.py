"""Utilities for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any

from .errors import BadImportError


def import_dotted_dict(dotted: str) -> dict[str, Any]:
    """Get a JSON object from a dotted python import."""
    module_path, member = dotted.split(":")
    submodules = module_path.split(".")[1:]
    current = __import__(module_path)
    for sub in submodules:
        current = getattr(current, sub)
    candidate = getattr(current, member)
    if callable(candidate):
        candidate = candidate()

    if not isinstance(candidate, dict):
        msg = f"Failed to resolve {dotted} as a dict, found {type(candidate)}"
        raise BadImportError(msg)

    return candidate
