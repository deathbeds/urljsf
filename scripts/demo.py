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
TOML = sorted(DEMO.glob("*.toml"))
JSON_FMT = {"sort_keys": True, "indent": 2}


DECODERS = {"yaml": lambda t: yaml.load(t), "json": lambda t: json.loads(t)}
ENCODERS = {"yaml": lambda d: _safe_dump(d), "json": lambda d: json.dumps(d, indent=2)}


def _safe_dump(d: dict[str, Any]) -> str:
    with StringIO() as io:
        yaml.dump(d, io)
        return io.getvalue()


def main() -> int:
    if not TOML:
        print("no toml in", DEMO)
        return 1

    wrote = []
    for toml in TOML:
        d = tomllib.loads(toml.read_text(**UTF8))
        norm = json.dumps(d, **JSON_FMT)
        stem = toml.stem
        for fmt, encode in ENCODERS.items():
            out = DEMO / f"{stem}.{fmt}"
            if out.exists():
                old = json.dumps(DECODERS[fmt](out.read_text(**UTF8)), **JSON_FMT)
                if old == norm:
                    continue
            wrote += [out]
            print("... writing", out)
            out.write_text(encode(d), **UTF8)

    rc = 0

    if wrote:
        rc = call(["yarn", "prettier", "--write", *wrote])

    return rc


if __name__ == "__main__":
    sys.exit(main())
