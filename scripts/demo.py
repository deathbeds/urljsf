"""Update the js demo."""

from __future__ import annotations

import json
import sys
from io import StringIO
from pathlib import Path
from subprocess import call
from typing import Any

import tomllib
from ruamel.yaml import YAML

yaml = YAML(typ="safe")
yaml.default_flow_style = False

UTF8 = {"encoding": "utf-8"}

HERE = Path(__file__).parent
ROOT = HERE.parent
DEMO = ROOT / "js/demo"
INDEX = DEMO / "index.html"
TOML = sorted(DEMO.glob("toml/*.toml"))
JSON_FMT = {"sort_keys": True, "indent": 2}

DECODERS = {
    "yaml": lambda t: yaml.load(t),
    "json": lambda t: json.loads(t),
}
ENCODERS = {
    "yaml": lambda d: _safe_dump(d),
    "json": lambda d: json.dumps(d, indent=2),
}


def _safe_dump(d: dict[str, Any]) -> str:
    """Dump YAML to strings."""
    with StringIO() as io:
        yaml.dump(d, io)
        return io.getvalue()


def _normalize(d: dict[str, Any]) -> str:
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
        for fmt, encode in ENCODERS.items():
            print(".", end="")
            data = tomllib.loads(raw.replace("toml", fmt))
            if stem == "urljsf":
                data.update(
                    iframe=True,
                )
            normal = _normalize(data)
            out = DEMO / f"{fmt}/{stem}.{fmt}"
            if out.exists():
                old = _normalize(DECODERS[fmt](out.read_text(**UTF8)))
                if old == normal:
                    continue
            print("\n... writing", out)
            out.parent.mkdir(exist_ok=True)
            out.write_text(encode(data).strip() + "\n", **UTF8)
            wrote += [out]

    rc = 0

    if wrote:
        rc = call(["yarn", "prettier", "--write", *wrote])
    else:
        print(" ok")

    return rc


if __name__ == "__main__":
    sys.exit(main())
