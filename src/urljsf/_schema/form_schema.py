"""JSON Schema for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from . import props_schema


class AnyFileFormat(Enum):
    """a format that can be serialized or deserialized"""

    json = "json"
    toml = "toml"
    yaml = "yaml"


AnySchemaLocation = str


AnyUrlTemplate = str


@dataclass
class FileForm:
    """a description of a form that builds a data file"""

    format: AnyFileFormat
    schema_: AnySchemaLocation
    form_data: AnySchemaLocation | None = None
    props: props_schema.Props | None = None
    prune_empty: bool | None = None
    ui_schema: AnySchemaLocation | None = None


@dataclass
class UrlForm:
    """a definition of a form to build a URL"""

    form_data: AnySchemaLocation | None = None
    props: props_schema.Props | None = None
    schema_: AnySchemaLocation | None = None
    ui_schema: AnySchemaLocation | None = None


@dataclass
class Urljsf:
    """A schema for building forms for building URLs for building..."""

    file_form: FileForm
    url_form: UrlForm
    url_template: AnyUrlTemplate
    iframe: bool | None = None
    iframe_style: str | None = None
