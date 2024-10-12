"""Convert various files."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

import json
import sys
from pathlib import Path
from subprocess import call as _call
from typing import Any

import tomllib

VERBOSE = False
CMD_DELIM = " \\\n\t" if VERBOSE else " "
UTF8 = {"encoding": "utf-8"}
PY_HEADER = '''"""JSON Schema for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
'''
ROOT = Path(__file__).parent.parent


def call(args: list[str | Path], **kwargs: Any) -> int:
    """Echo and then call a command."""
    args = list(map(str, args))
    print("In:", kwargs.get("cwd", ROOT))
    print(">>>", CMD_DELIM.join(args), "\n")
    rc = _call(args, **kwargs)
    if rc:
        print("FAIL", rc)
    return rc


def ts_to_json(in_path: Path, out_path: Path) -> int:
    """Get JSON schema from TypeScript."""
    args = [
        "yarn",
        "ts-json-schema-generator",
        "--tsconfig=js/tsconfig.json",
        f"--path={in_path}",
        f"--out={out_path}",
    ]
    return call(args) or call(["yarn", "prettier", "--write", out_path])


def toml_to_json(in_path: Path, out_path: Path) -> int:
    """Get JSON schema from TOML."""
    raw = tomllib.loads(in_path.read_text(**UTF8))
    for def_schema in raw["definitions"].values():
        desc = def_schema.get("description")
        if desc:
            def_schema["description"] = desc.strip()
    text = json.dumps(raw, indent=2)
    out_path.write_text(text, **UTF8)
    return call(["yarn", "prettier", "--write", out_path])


def json_to_ts(in_path: Path, out_path: Path) -> int:
    """Get TypeScript from JSON Schema."""
    args = [
        "yarn",
        "build:schema",
        "--style.singleQuote",
        "--no-style.semi",
        "--no-additionalProperties",
        "--unreachableDefinitions",
        f"--input={in_path}",
        f"--output={out_path}",
    ]
    return call(args) or call([
        "yarn",
        "prettier",
        "--write",
        str(out_path),
    ])


def json_to_py(in_path: Path, out_path: Path) -> int:
    """Get python from JSON Schema."""
    in_parent, out_parent = in_path.parent, out_path.parent
    args = [
        "datamodel-codegen",
        "--output-model-type=dataclasses.dataclass",
        "--target-python-version=3.11",
        "--use-schema-description",
        "--use-union-operator",
        "--use-standard-collections",
        "--input-file-type=jsonschema",
        f"--input={in_parent}",
        f"--output={out_parent}",
        "--custom-file-header",
        PY_HEADER,
    ]

    def fix() -> None:
        """Fix up generated python."""
        for path in out_parent.glob("*.py"):
            text = path.read_text(**UTF8)
            text = text.replace(
                "from ..props import schema", "from . import props_schema"
            ).replace("schema.Props", "props_schema.Props")
            path.write_text(text, **UTF8)
        return 0

    return (
        call(args)
        or fix()
        or call(["ruff", "format", f"{out_parent}"])
        or call(["ruff", "check", "--fix-only", "--unsafe-fixes", f"{out_parent}"])
    )


def main(in_path: Path, out_path: Path) -> int:
    """Convert some files."""
    key = in_path.suffix, out_path.suffix
    converter = {
        (".ts", ".json"): ts_to_json,
        (".toml", ".json"): toml_to_json,
        (".json", ".ts"): json_to_ts,
        (".json", ".py"): json_to_py,
    }[key]
    rc = converter(in_path, out_path)
    print(
        f"""... converted: {in_path.relative_to(ROOT)}
        to: {out_path.relative_to(ROOT)}"""
    )
    return rc


if __name__ == "__main__":
    sys.exit(main(Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()))
