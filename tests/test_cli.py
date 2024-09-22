"""Verify the standalone cli."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import json
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from pathlib import Path

    from pytest_console_scripts import ScriptRunner


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
    (tmp_path / "schema.json").write_text(
        json.dumps({"type": "object", "properties": {"foo": {"type": "string"}}}),
        encoding="utf-8",
    )
    r = script_runner.run(
        ["prjsf", "schema.json", "https://github.com/foo/bar/baz"], cwd=str(tmp_path)
    )
    assert r.success
    out = tmp_path / "_prjsf_output"
    expected = [
        "index.html",
        "_static/prjsf/third-party-licenses.json",
        "_static/vendor/bootstrap/LICENSE",
    ]
    for rel in expected:
        assert (out / rel).exists()
