"""Dynamic schema demos."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

import functools
import json
import operator
import sys
from pathlib import Path
from typing import TYPE_CHECKING, Any

import requests_cache

UTF8 = {"encoding": "utf-8"}
HERE = Path(__file__).parent
ROOT = HERE.parent
BUILD = ROOT / "build"
OUTPUTS = BUILD / "feedstock-outputs.json"


OUTPUTS_URL = (
    "https://raw.githubusercontent.com/conda-forge/feedstock-outputs/single-file/"
    f"{OUTPUTS.name}"
)
S = requests_cache.CachedSession(BUILD / "cf-")

if TYPE_CHECKING:
    from urljsf._schema import Urljsf

DRAFT_7 = {"$schema": "http://json-schema.org/draft-07/schema#"}


#: this is used in an example in `demos/python.md`
PY_SCHEMA = {
    **DRAFT_7,
    "type": "object",
    "required": ["favorite"],
    "properties": {
        "favorite": {
            "title": "favorite python module",
            "description": "pick a module",
            "type": "string",
            "enum": sorted(
                {m.split(".")[0] for m in sys.modules}, key=lambda x: x.lower()
            ),
        },
    },
}


def ui_widget(widget: str) -> dict[str, str]:
    """Build a UI widget."""
    return {"ui:widget": widget} if widget else {}


def str_format(fmt: str) -> dict[str, str]:
    """Build a ``string`` subschema with a ``format``."""
    return {"format": fmt}


def suid(type_: str, schema: dict[str, str], ui: dict[str, str]) -> str:
    """Build a schema/UI pair ID."""
    bits = [*functools.reduce(operator.iadd, [*schema.items(), *ui.items()], ())]
    return f"""{type_}__{"_".join(bits).replace(":", "-") if bits else "default"}"""


# https://rjsf-team.github.io/react-jsonschema-form/docs/usage/widgets
STR_FORMATS = ["email", "uri", "data-url", "date", "date-time", "time"]
UI_FIELDS = {
    "boolean": [({}, ui_widget(w)) for w in [None, "radio", "select"]],
    "string": [
        *[({}, ui_widget(w)) for w in [None, "textarea", "password", "color"]],
        *[(str_format(w), {}) for w in STR_FORMATS],
    ],
    "number": [({}, ui_widget(w)) for w in [None, "updown", "range"]],
}
UI_FIELDS["integer"] = UI_FIELDS["number"]


def kitchen_sink_schema() -> dict[str, Any]:
    """Generate a draft 7 schema that exercises many UI options."""
    properties = {}
    for type_, schema_uis in UI_FIELDS.items():
        for schema, ui in schema_uis:
            label = ", ".join(map(str, [*schema.values(), *ui.values()]))
            label = f"as {label}" if label else "default"
            properties[suid(type_, schema, ui)] = {
                "type": type_,
                "title": f"""{type_} ({label})""",
                **schema,
            }
    return {
        **DRAFT_7,
        "title": "Kitchen Sink",
        "type": "object",
        "properties": properties,
    }


def kitchen_sink_ui_schema() -> dict[str, Any]:
    """Generate an RJSF UI schema that exercises many UI options."""
    fields = {}
    for type_, schema_uis in UI_FIELDS.items():
        for schema, ui in schema_uis:
            fields[suid(type_, schema, ui)] = ui
    return fields


def installer() -> Urljsf:
    """Define a ``pixi`` project that can build an installer."""
    if not OUTPUTS.exists():
        OUTPUTS.write_bytes(S.get(OUTPUTS_URL).content)

    feedstocks = json.loads(OUTPUTS.read_text(**UTF8))
    packages = sorted({*functools.reduce(operator.iadd, [*feedstocks.values()])})

    subdirs = [
        "emscripten-wasm32",
        "linux-32",
        "linux-64",
        "linux-aarch64",
        "linux-armv6l",
        "linux-armv7l",
        "linux-ppc64",
        "linux-ppc64le",
        "linux-riscv32",
        "linux-riscv64",
        "linux-s390x",
        "noarch",
        "osx-64",
        "osx-arm64",
        "unknown",
        "wasi-wasm32",
        "win-32",
        "win-64",
        "win-arm64",
        "zos-z",
    ]

    pixi_schema = {
        **DRAFT_7,
        "title": "a partial pixi project",
        "description": (
            "a description of a `pixi` project. this doesn't map 1:1 with "
            "`pixi`'s own extensive schema, but instead builds an intermediate."
        ),
        "type": "object",
        "required": ["platforms", "dependencies", "channels"],
        "properties": {
            "platforms": {
                "type": "array",
                "items": {"$ref": "#/definitions/a-subdir"},
                "uniqueItems": True,
                "minItems": 1,
            },
            "dependencies": {
                "type": "array",
                "items": {"$ref": "#/definitions/a-pixi-package-def"},
                "minLength": 1,
            },
            "channels": {"type": "array", "items": {"type": "string"}, "minLength": 1},
        },
        "definitions": {
            "a-subdir": {"type": "string", "enum": subdirs},
            "a-package-name": {
                "type": "string",
                "minLength": 1,
                "pattern": r"^[a-zA-Z_\.\-\d]+$",
            },
            "a-pixi-package-def": {
                "type": "object",
                "required": ["package"],
                "properties": {
                    "package": {"$ref": "#/definitions/a-package-name"},
                    "match-spec": {"type": "string", "default": "*"},
                    "channel": {"type": "string", "format": "uri"},
                },
            },
        },
    }

    pixi_ui_schema = {
        "channels": {"items": {"ui:options": {"label": False}}},
        "dependencies": {
            "items": {
                "package": {
                    "ui:options": {"widget": "urljsf:DataList", "options": packages}
                },
                "ui:options": {
                    "label": False,
                    "order": ["package", "match-spec", "channel"],
                    "urljsfGrid": {
                        "children": {
                            "package": ["col-md-4"],
                            "match-spec": ["col-md-4"],
                            "channel": ["col-md-4"],
                        }
                    },
                },
            }
        },
    }

    pixi_form_data = {
        "platforms": ["linux-64"],
        "channels": ["conda-forge"],
        "dependencies": [{"package": "python", "match-spec": "3.13.*"}],
    }

    pixi_checks = {
        "Unique `package` names": """
{% for pkg, deps in data["pixi-toml"].dependencies | default([]) | groupby("package") %}
{% set dupes = deps | length %}
{% if dupes > 1 %}
- [ ] {{ dupes }} dependencies have the name `{{ pkg }}`
{% endif %}
{% endfor %}
"""
    }

    defn: Urljsf = {
        "forms": {
            "pixi-toml": {
                "schema": pixi_schema,
                "ui_schema": pixi_ui_schema,
                "form_data": pixi_form_data,
            }
        },
        "templates": {"url": "#", "checks": pixi_checks},
    }

    return defn
