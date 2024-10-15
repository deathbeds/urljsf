"""Schema for ``urljsf``."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import json
from pathlib import Path

from jsonschema import Draft7Validator

from .constants import SCHEMA_VERSION, UTF8

HERE = Path(__file__).parent
STATIC = HERE / "_static"
SCHEMA = STATIC / "schema"
CURRENT_SCHEMA = SCHEMA / SCHEMA_VERSION

FORM_SCHEMA = CURRENT_SCHEMA / "form.schema.json"

URLJSF_VALIDATOR = Draft7Validator(
    json.loads(FORM_SCHEMA.read_text(**UTF8)),
    format_checker=Draft7Validator.FORMAT_CHECKER,
)