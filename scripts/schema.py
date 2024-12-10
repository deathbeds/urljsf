"""Convert various JSON Schema-related files."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path
from subprocess import call as _call
from typing import Any, Callable

import tomllib

VERBOSE = False
CMD_DELIM = " \\\n\t" if VERBOSE else " "
UTF8 = {"encoding": "utf-8"}
PY_HEADER = '''"""JSON Schema for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
'''
ROOT = Path(__file__).parent.parent
YARN = f"""{shutil.which("yarn") or shutil.which("yarn.cmd")}"""


def call(args: list[Any], **kwargs: Any) -> int:
    """Echo and then call a command."""
    str_args = list(map(str, args))
    print("In:", kwargs.get("cwd", ROOT))
    print(">>>", CMD_DELIM.join(str_args), "\n")
    rc = _call(args, **kwargs)
    if rc:
        print("FAIL", rc)
    return rc


def ts_to_json(in_path: Path, out_path: Path) -> int:
    """Get JSON schema from TypeScript."""
    args = [
        YARN,
        "ts-json-schema-generator",
        "--tsconfig=js/tsconfig.json",
        f"--path={in_path}",
        f"--out={out_path}",
    ]
    if out_path.name == "props.schema.json":
        args += ["--type=Props"]
    elif out_path.name == "ui.schema.json":
        args += ["--type=UISchema"]
    rc = call(args)

    if in_path.name == "_props.ts":
        raw = json.loads(out_path.read_text(**UTF8))
        for defn in []:  # KnownUISchema
            raw["definitions"][defn].pop("additionalProperties")
        out_path.write_text(json.dumps(raw, indent=2))

    if rc:
        return rc
    return call([YARN, "prettier", "--write", out_path])


def toml_to_json(in_path: Path, out_path: Path, *def_paths: Path) -> int:
    """Get JSON schema from TOML."""
    raw = tomllib.loads(in_path.read_text(**UTF8).replace("./props.schema.json", ""))
    for defs_path in def_paths:
        raw["definitions"].update(
            json.loads(defs_path.read_text(**UTF8))["definitions"]
        )
    for def_schema in raw["definitions"].values():
        desc = def_schema.get("description")
        if desc:
            def_schema["description"] = desc.strip()
    text = json.dumps(raw, indent=2)
    out_path.write_text(text, **UTF8)
    return call([YARN, "prettier", "--write", out_path])


def json_to_ts(in_path: Path, out_path: Path) -> int:
    """Get TypeScript from JSON Schema."""
    args = [
        "node",
        ROOT / "node_modules/.bin/json2ts",
        "--style.singleQuote",
        "--no-style.semi",
        "--no-additionalProperties",
        "--unreachableDefinitions",
        f"--output={out_path}",
        f"--input={in_path}",
    ]

    return call(args) or call([
        YARN,
        "prettier",
        "--write",
        str(out_path),
    ])


RAW_TYPING_HEADER = """from typing_extensions import Required"""

SCHEMA_PY_PREAMBLE = '''
"""Generated schema for ``urljsf``"""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations
import sys

if sys.version_info >= (3, 11):  # pragma: no cover
    from typing import Any, Literal, TypeAlias, TypedDict, Union, Required
else:  # pragma: no cover
    from typing import Any, Literal, TypedDict, Union
    from typing_extensions import Required, TypeAlias
'''


def json_to_py(in_path: Path, out_path: Path) -> int:
    """Get python from JSON Schema.

    This tool doesn't handle relative ``$refs`` very well.
    """
    args = [
        "jsonschema-gentypes",
        "--python-version=3.9",
        f"--json-schema={in_path}",
        f"--python={out_path}",
    ]

    def _fix() -> int:
        """Fix python output."""
        raw = out_path.read_text(**UTF8).split(RAW_TYPING_HEADER)[1]
        raw = f"{SCHEMA_PY_PREAMBLE}{raw}"
        out_path.write_text(raw, **UTF8)
        return 0

    return (
        call(args)
        or _fix()
        or call(["ruff", "format", f"{out_path}"])
        or call(["ruff", "check", "--fix-only", "--unsafe-fixes", f"{out_path}"])
    )


CONVERTERS: dict[tuple[str, str], Callable[..., int]] = {
    (".ts", ".json"): ts_to_json,
    (".toml", ".json"): toml_to_json,
    (".json", ".ts"): json_to_ts,
    (".json", ".py"): json_to_py,
}


def main(in_path: Path, out_path: Path, *extra_paths: Path) -> int:
    """Convert some files."""
    key = in_path.suffix, out_path.suffix
    converter = CONVERTERS[key]
    rc = converter(in_path, out_path, *extra_paths)
    print(
        f"""... converted: {in_path.relative_to(ROOT)}
        to: {out_path.relative_to(ROOT)}"""
    )
    print("... lines:", len(out_path.read_text(**UTF8).splitlines()))
    return rc


if __name__ == "__main__":
    sys.exit(main(*[Path(p).resolve() for p in sys.argv[1:]]))
