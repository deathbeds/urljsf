"""Update the js demo source files."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import json
import sys
from io import StringIO
from pathlib import Path
from subprocess import call
from typing import Any, Callable

import ruamel.yaml.representer
import tomllib

UTF8 = {"encoding": "utf-8"}

HERE = Path(__file__).parent
ROOT = HERE.parent
DEMO = ROOT / "js/demo"
INDEX = DEMO / "index.html"
TOML = sorted(DEMO.glob("toml/*.toml"))
JSON_FMT: Any = {"sort_keys": True, "indent": 2}
YLS_COMMENT = "# yaml-language-server: $schema="

DECODERS: dict[str, Callable[[str], dict[str, Any]]] = {
    "yaml": lambda t: yaml.load(t),
    "json": lambda t: json.loads(t),
}
ENCODERS: dict[str, Callable[[dict[str, Any]], str]] = {
    "yaml": lambda d: _safe_dump(d),
    "json": lambda d: json.dumps(d, indent=2),
}


class YamlRepresenter(ruamel.yaml.representer.RoundTripRepresenter):
    """A custom  YAML representer."""

    def represent_str(self, s: str) -> ruamel.yaml.ScalarNode:
        """Force sane strings."""
        if "\n" in s:
            return self.represent_scalar("tag:yaml.org,2002:str", s, style="|")
        return self.represent_scalar("tag:yaml.org,2002:str", s)


YamlRepresenter.add_representer(str, YamlRepresenter.represent_str)

yaml = ruamel.yaml.YAML(typ="safe")
yaml.default_flow_style = False
yaml.Representer = YamlRepresenter


def _preserve_order(obj: Any) -> Any:
    """Replace with order-preserving yaml."""
    if isinstance(obj, dict):
        return ruamel.yaml.CommentedMap(obj)
    if isinstance(obj, (str, int, bool, float)):
        return obj
    if isinstance(obj, (list, tuple)):
        return [_preserve_order(v) for v in obj]
    raise ValueError(obj)


def _safe_dump(d: dict[str, Any]) -> str:
    """Dump YAML to strings."""
    with StringIO() as io:
        yaml.dump(_preserve_order(d), io)
        return io.getvalue()


def _normalize(d: dict[str, Any]) -> str:
    """Generate normalized JSON."""
    return json.dumps(d, **JSON_FMT)


def main() -> int:
    """Update the demo JSON and YAML from TOML."""
    if not TOML:
        print("no toml in", DEMO)
        return 1

    wrote = []
    for toml in TOML:
        raw = toml.read_text(**UTF8)
        stem = toml.stem
        kind = "ui" if "uischema" in stem else None
        for fmt, encode in ENCODERS.items():
            print(".", end="")
            data = tomllib.loads(raw.replace("toml", fmt).replace("TOML", fmt.upper()))
            if stem == "urljsf" and fmt == "yaml":
                data.update(iframe=True)
            normal = _normalize(data)
            out = DEMO / f"{fmt}/{stem}.{fmt}"
            if out.exists():
                old = _normalize(DECODERS[fmt](out.read_text(**UTF8)))
                if old == normal:
                    continue
            print("\n... writing", out)
            out.parent.mkdir(exist_ok=True)
            chunks = [encode(data).strip(), ""]
            if kind and fmt == "yaml":
                chunks = [
                    f"{YLS_COMMENT}../../schema/v0/{kind}.schema.json#",
                    "",
                    *chunks,
                ]
            out.write_text("\n".join(chunks), **UTF8)
            wrote += [out]

    rc = 0

    if wrote:
        rc = call(["yarn", "prettier", "--write", *wrote])
    else:
        print(" ok")

    return rc


if __name__ == "__main__":
    sys.exit(main())
