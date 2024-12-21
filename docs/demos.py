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

import requests

UTF8 = {"encoding": "utf-8"}
HERE = Path(__file__).parent
ROOT = HERE.parent
BUILD = ROOT / "build"
OUTPUTS = BUILD / "feedstock-outputs.json"
LICENSES = BUILD / "licenses.json"
REAL_PIXI_SCHEMA = BUILD / "schema.json"

URLS = {
    OUTPUTS: (
        "https://raw.githubusercontent.com/conda-forge/feedstock-outputs/single-file/"
        f"{OUTPUTS.name}"
    ),
    LICENSES: (
        "https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/"
        f"json/{LICENSES.name}"
    ),
    REAL_PIXI_SCHEMA: ("https://pixi.sh/v0.39.3/schema/manifest/schema.json",),
}

FALLBACKS: dict[Path, dict[str, Any]] = {
    REAL_PIXI_SCHEMA: {
        "type": "object",
    },
    OUTPUTS: {
        "_": ["__the-feedstocks-did-not-load__"],
        "7zip": ["7zip"],
        "aab": ["aab"],
        "python": ["pypy-meta", "python", "graalpy"],
        "zziplib": ["zziplib"],
    },
    LICENSES: {
        "licenses": [
            {
                "reference": "https://spdx.org/licenses/0BSD.html",
                "isDeprecatedLicenseId": False,
                "detailsUrl": "https://spdx.org/licenses/0BSD.json",
                "referenceNumber": 27,
                "name": "BSD Zero Clause License",
                "licenseId": "0BSD",
                "seeAlso": [
                    "http://landley.net/toybox/license.html",
                    "https://opensource.org/licenses/0BSD",
                ],
                "isOsiApproved": True,
            },
            {
                "reference": "https://spdx.org/licenses/AFL-1.1.html",
                "isDeprecatedLicenseId": False,
                "detailsUrl": "https://spdx.org/licenses/AFL-1.1.json",
                "referenceNumber": 572,
                "name": "Academic Free License v1.1",
                "licenseId": "AFL-1.1",
                "seeAlso": [
                    "http://opensource.linux-mirror.org/licenses/afl-1.1.txt",
                    "http://wayback.archive.org/web/20021004124254/http://www.opensource.org/licenses/academic.php",
                ],
                "isOsiApproved": True,
                "isFsfLibre": True,
            },
            {
                "reference": "https://spdx.org/licenses/BSD-3-Clause.html",
                "isDeprecatedLicenseId": False,
                "detailsUrl": "https://spdx.org/licenses/BSD-3-Clause.json",
                "referenceNumber": 394,
                "name": 'BSD 3-Clause "New" or "Revised" License',
                "licenseId": "BSD-3-Clause",
                "seeAlso": [
                    "https://opensource.org/licenses/BSD-3-Clause",
                    "https://www.eclipse.org/org/documents/edl-v10.php",
                ],
                "isOsiApproved": True,
                "isFsfLibre": True,
            },
            {
                "reference": "https://spdx.org/licenses/ZPL-2.1.html",
                "isDeprecatedLicenseId": False,
                "detailsUrl": "https://spdx.org/licenses/ZPL-2.1.json",
                "referenceNumber": 652,
                "name": "Zope Public License 2.1",
                "licenseId": "ZPL-2.1",
                "seeAlso": ["http://old.zope.org/Resources/ZPL/"],
                "isOsiApproved": True,
                "isFsfLibre": True,
            },
        ],
    },
}

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


def fetch_json(path: Path) -> dict[str, Any]:
    """Fetch some (cached) JSON, or provide a fallback value on any error."""
    try:
        url = URLS[path]
        if not path.exists():
            r = requests.get(url, timeout=10)
            r.raise_for_status()
            path.write_text(json.dumps(r.json(), indent=2, sort_keys=True), **UTF8)
            sys.stderr.write(f"Fetched {int(path.stat().st_size / 1024)} kb from {url}")
        return dict(json.loads(path.read_text(**UTF8)))
    except Exception as err:
        sys.stderr.write(f"ERROR {url}: {err}")
        return dict(FALLBACKS[path])


def installer() -> Urljsf:
    """Define a ``pixi`` project that can build an installer."""
    feedstocks = fetch_json(OUTPUTS)
    packages = sorted({*functools.reduce(operator.iadd, [*feedstocks.values()])})
    licenses = [
        lic["licenseId"]
        for lic in fetch_json(LICENSES)["licenses"]
        if lic.get("isOsiApproved") and lic.get("isFsfLibre")
    ]
    real_pixi_schema = fetch_json(REAL_PIXI_SCHEMA)

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
            "icon": {
                "description": "an icon in SVG, PNG",
                "type": "string",
                "format": "data-url",
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
                "icon",
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
        "icon": {
            "ui:options": {
                "accept": ".png",
            }
        },
    }

    pixi_form_data = {
        "name": "MyInstaller",
        "version": "0.1.0",
        "license": "BSD-3-Clause",
        "platforms": ["linux-64", "osx-64", "osx-arm64", "win-64"],
        "channels": ["conda-forge"],
        "dependencies": [{"package": "python", "spec": "*"}],
    }

    macro_import = "{% import '_pixi_toml' as p %}"

    pixi_checks = {
        "Unique `package` names": """
{% for pkg, deps in data.pixi.dependencies | default([]) | groupby("package") %}
{% set dupes = deps | length %}
{% if dupes > 1 %}
- [ ] {{ dupes }} dependencies have the name `{{ pkg }}`
{% endif %}
{% endfor %}
""",
        "`pixi.toml` is valid": macro_import
        + """
{{ p.pixi_toml(data.pixi, schema=config.forms.pixi.props.formContext.pixi_schema) }}
""",
    }

    toml_template = """
{% macro pixi_toml(p, schema=None) %}

{% set deps = [] %}

{% for dep in p.dependencies %}
  {% set e = dep.spec %}
  {% if dep.channel %}
    {% set e = {"version": dep.spec, "channel": dep.channel } %}
  {% endif %}
  {% set deps = (deps.push([dep.package, e]), deps) %}
{% endfor %}

{% set tool = {} %}

{% if data.pixi.icon %}
    {% set tool = {"icon": data.pixi.icon} %}
{% endif %}

{% set PT = {
  "project": {
    "name": p.name,
    "version": p.version,
    "platforms": p.platforms,
    "channels": p.channels
  },
  "dependencies": (deps | from_entries),
  "tool": tool
} | prune %}
{% if schema %}
{% for err in PT | schema_errors(schema) %}
- [ ] {{ err.message }}
{% endfor %}
{% else %}
{{ PT | to_toml }}
{% endif %}
{% endmacro %}
    """

    below_template = (
        macro_import
        + """
{% set t = (p.pixi_toml(data.pixi) | trim).val %}

_As TOML:_

```toml
{{ t }}
```

_As URL:_

```
data:application/toml,{{ t | urlencode  }}
```

{%- set files = [
    ["pixi.toml", t],
    ["README.md", "# " ~ data.pixi.name],
    [".gitignore", ".pixi"],
    [".github", {
        "pull_request_template.md": [
            "thanks for contributing to " ~ data.pixi.name,
            {"level": 9}
        ]
    }]
] -%}

_As a `.zip` archive with:
- the `pixi.toml`
- a `.gitignore` file
- a `README.md`
- a `.github/pull_request_template.md`
{%- if data.pixi.icon -%}
    {%- set regExp = r/name=(.*?);/ -%}
    {%- set icon = data.pixi.icon | data_uri_file -%}
    {%- set files = (files.push([icon, data.pixi.icon]), files) %}
- `{{ icon }}`, an icon `{{ data.pixi.icon | data_uri_mime }}` file)
{%- endif %} and ):_

```
{{
    files
    | from_entries
    | prune
    | to_zip_url(level=0, name=data.pixi.name ~ ".zip")
}}
```
"""
    )

    defn: Urljsf = {
        "forms": {
            "pixi": {
                "schema": pixi_schema,
                "ui_schema": pixi_ui_schema,
                "form_data": pixi_form_data,
                "props": {"formContext": {"pixi_schema": real_pixi_schema}},
            }
        },
        "nunjucks": {"filters": ["toml", "zip"]},
        "templates": {
            "_pixi_toml": toml_template,
            # known
            "url": [
                macro_import,
                "data:application/toml,",
                "{{ (p.pixi_toml(data.pixi) | trim).val | urlencode }}",
            ],
            "download_filename": "pixi.toml",
            "submit_button": "Download pixi.toml",
            # extra
            "below_pixi": below_template,
        },
        "checks": pixi_checks,
    }

    return defn
