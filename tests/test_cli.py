"""Verify the standalone cli."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import json
from typing import TYPE_CHECKING

import pytest

from .conftest import UTF8

if TYPE_CHECKING:
    from pathlib import Path

    from pytest_console_scripts import ScriptRunner

SIMPLE_SCHEMA = {"type": "object", "properties": {"foo": {"type": "string"}}}
GH = ["-g", "https://github.com/org/repo/new/branch"]


def test_cli_help(script_runner: ScriptRunner) -> None:
    """Verify help is printed."""
    r = script_runner.run(["prjsf", "--help"], check=True)
    assert "help" in r.stdout


def test_cli_version(script_runner: ScriptRunner) -> None:
    """Verify version is printed."""
    import prjsf

    r = script_runner.run(["prjsf", "--version"], check=True)
    assert prjsf.__version__ in r.stdout


def test_cli_run(script_runner: ScriptRunner, tmp_path: Path) -> None:
    """Verify a site is built."""
    (tmp_path / "schema.json").write_text(json.dumps(SIMPLE_SCHEMA), **UTF8)
    r = script_runner.run(["prjsf", *GH, "-s", "schema.json"], cwd=str(tmp_path))
    assert r.success
    assert_outputs(tmp_path)


def test_cli_urls(script_runner: ScriptRunner, tmp_path: Path) -> None:
    """Verify remote URLs can be used."""
    url = "https://foo.bar/schema.json"
    r = script_runner.run(
        ["prjsf", *GH, "-s", url, "-d", url, "-u", url], cwd=str(tmp_path)
    )
    assert r.success
    assert_outputs(tmp_path)


@pytest.mark.parametrize("py_style", ["simple", "nested"])
def test_cli_run_py(
    script_runner: ScriptRunner, py_tmp_path: Path, py_style: str
) -> None:
    """Verify a site is built with a python schema."""
    if py_style == "simple":
        (py_tmp_path / "schema.py").write_text(
            f"""SCHEMA = {json.dumps(SIMPLE_SCHEMA)}""", **UTF8
        )
        dotted = "schema:SCHEMA"
        extra_files = ["schema-schema.json"]
    elif py_style == "nested":
        nested = py_tmp_path / "nested"
        nested.mkdir()
        (nested / "__init__.py").write_text("# empty", **UTF8)
        (nested / "schema.py").write_text(
            f"""get_schema = lambda: {json.dumps(SIMPLE_SCHEMA)}""", **UTF8
        )
        dotted = "nested.schema:get_schema"
        extra_files = ["nested.schema-get_schema.json"]

    r = script_runner.run(
        ["prjsf", *GH, "--py-schema", dotted],
        cwd=str(py_tmp_path),
    )
    assert r.success
    assert_outputs(py_tmp_path, extra_files=extra_files)


def assert_outputs(
    path: Path, *, out: Path | None = None, extra_files: list[Path] | None = None
) -> None:
    """Assert a number of files exist."""
    expected = [
        "index.html",
        "_static/prjsf/third-party-licenses.json",
        "_static/vendor/bootstrap/LICENSE",
    ]
    out = out or (path / "_prjsf_output")
    missing = {}

    for rel in expected:
        if not (out / rel).exists():
            missing[out / rel] = True

    for file_ in extra_files or []:
        if not (out / file_).exists():
            missing[out / file_] = True

    if missing:
        print("\n".join(map(str, path.rglob("*"))))

    assert not missing
