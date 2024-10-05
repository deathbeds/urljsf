"""Dynamic schema demos."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
import functools
import operator
import sys
from typing import Any

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
