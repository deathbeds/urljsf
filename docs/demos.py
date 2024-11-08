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
LICENSES = BUILD / "licenses.json"

OUTPUTS_URL = (
    "https://raw.githubusercontent.com/conda-forge/feedstock-outputs/single-file/"
    f"{OUTPUTS.name}"
)
LICENSES_URL = (
    "https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/"
    f"json/{LICENSES.name}"
)
S = requests_cache.CachedSession(BUILD / "demos-")

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

    if not LICENSES.exists():
        LICENSES.write_bytes(S.get(LICENSES_URL).content)

    feedstocks = json.loads(OUTPUTS.read_text(**UTF8))
    packages = sorted({*functools.reduce(operator.iadd, [*feedstocks.values()])})
    licenses = [
        lic["licenseId"]
        for lic in json.loads(LICENSES.read_text(**UTF8))["licenses"]
        if lic.get("isOsiApproved") and lic.get("isFsfLibre")
    ]

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
        "required": [
            "name",
            "version",
            "license",
            "platforms",
            "dependencies",
            "channels",
        ],
        "properties": {
            "name": {
                "description": "a name for the installer",
                "type": "string",
                "minLength": 1,
            },
            "version": {
                "description": "the version of the installer",
                "type": "string",
                "minLength": 1,
                "pattern": r"\d+[\d\.]+((a|b|rc)[\d]+)?",
            },
            "license": {
                "description": "the license under which to relase the installer",
                "type": "string",
                "minLength": 1,
            },
            "platforms": {
                "description": (
                    "the (operating system, architecture) pairs where the installer"
                    " should work"
                ),
                "type": "array",
                "items": {"$ref": "#/definitions/a-subdir"},
                "uniqueItems": True,
                "minItems": 1,
            },
            "channels": {
                "description": (
                    "ordered URLs (first wins) for sources of packages: "
                    " fragments wil have `https://conda.anaconda.org/` prepended"
                ),
                "type": "array",
                "items": {"type": "string", "format": "uri-reference"},
                "minLength": 1,
                "default": ["conda-forge"],
            },
            "dependencies": {
                "description": "the packages this installer should include",
                "type": "array",
                "items": {"$ref": "#/definitions/a-pixi-package-def"},
                "minLength": 1,
            },
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
                    "spec": {"type": "string", "default": "*"},
                    "channel": {"type": "string", "format": "uri-reference"},
                },
            },
        },
    }

    pixi_ui_schema = {
        "ui:options": {
            "order": [
                "name",
                "version",
                "license",
                "platforms",
                "channels",
                "dependencies",
            ]
        },
        "channels": {"items": {"ui:options": {"label": False}}},
        "license": {"ui:options": {"widget": "urljsf:datalist", "options": licenses}},
        "dependencies": {
            "items": {
                "package": {
                    "ui:options": {"widget": "urljsf:datalist", "options": packages}
                },
                "ui:options": {
                    "label": False,
                    "order": ["package", "spec", "channel"],
                    "urljsf:grid": {
                        "children": {
                            "package": ["col-md-4"],
                            "spec": ["col-md-4"],
                            "channel": ["col-md-4"],
                        }
                    },
                },
            }
        },
    }

    pixi_form_data = {
        "name": "MyInstaller",
        "version": "0.1.0",
        "license": "BSD-3-Clause",
        "platforms": ["linux-64", "osx-64", "osx-arm64", "win-64"],
        "channels": ["conda-forge"],
        "dependencies": [{"package": "python", "spec": "3.13.*"}],
    }

    pixi_checks = {
        "Unique `package` names": """
{% for pkg, deps in data.pixi.dependencies | default([]) | groupby("package") %}
{% set dupes = deps | length %}
{% if dupes > 1 %}
- [ ] {{ dupes }} dependencies have the name `{{ pkg }}`
{% endif %}
{% endfor %}
"""
    }

    url_template = """
data:application/toml,
{% set deps = [] %}
{% for dep in data.pixi.dependencies %}
    {% set e = dep.spec %}
    {% if dep.channel %}
        {% set e = {"version": dep.spec, "channel": dep.channel } %}
    {% endif %}
    {% set deps = (deps.push([dep.package, e]), deps) %}
{% endfor %}
{{
    {
        "project": {
            "name": data.pixi.name,
            "version": data.pixi.version,
            "platforms": data.pixi.platforms,
            "channels": data.pixi.channels
        },
        "dependencies": (deps | from_entries)
    } | prune | to_toml | urlencode | safe
}}
    """

    defn: Urljsf = {
        "forms": {
            "pixi": {
                "schema": pixi_schema,
                "ui_schema": pixi_ui_schema,
                "form_data": pixi_form_data,
            }
        },
        "nunjucks": {"filters": ["toml"]},
        "templates": {
            "url": url_template,
            "submit_button": "View `pixi.toml`",
            "checks": pixi_checks,
        },
    }

    return defn
