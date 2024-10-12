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


@dataclass
class AnyObject:
    """An line object"""


AnySchemaLocation = str


AnyTemplate = str | list[str]


Checks = dict[str, AnyTemplate] | None


@dataclass
class Templates:
    """[`nunjucks`][nunjucks] strings (or lists of strings) that control how strings are built
    from forms.

    The [jinja compatibility layer][jinjacompat] is enabled, allowing for more expressive,
    python-like syntax. Some addition filters are included:

    - `base64` turns a string into its [Base64]-encoded alternative

    [nunjucks]: https://mozilla.github.io/nunjucks/templating.html
    [jinjacompat]: https://mozilla.github.io/nunjucks/api.html#installjinjacompat
    [Base64]: https://developer.mozilla.org/en-US/docs/Glossary/Base64
    """

    submit_button: AnyTemplate
    url: AnyTemplate
    checks: Checks | None = None


AnySchema = AnySchemaLocation | AnyObject


@dataclass
class FileForm:
    """a description of a form that builds a data file"""

    format: AnyFileFormat
    schema_: AnySchema
    form_data: AnySchema | None = None
    props: props_schema.Props | None = None
    prune_empty: bool | None = None
    ui_schema: AnySchema | None = None


@dataclass
class UrlForm:
    """a definition of a form to build a URL"""

    form_data: AnySchema | None = None
    props: props_schema.Props | None = None
    schema_: AnySchema | None = None
    ui_schema: AnySchema | None = None


@dataclass
class Forms:
    """forms used to build and populate a URL"""

    file: FileForm
    url: UrlForm


@dataclass
class Urljsf:
    """A schema for building forms for building URLs for building..."""

    forms: Forms
    templates: Templates
    field_id: str | None = None
    field_schema: str | None = None
    iframe: bool | None = None
    iframe_style: str | None = None
