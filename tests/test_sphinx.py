"""Verify behavior when run under ``sphinx-build``."""

# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from pathlib import Path

from pytest_console_scripts import ScriptRunner

from .conftest import NO_SCHEMA_JSON


def test_sphinx(a_project: str, script_runner: ScriptRunner, tmp_path: Path) -> None:
    """Verify a site builds."""
    build = tmp_path / "build"

    args = ["sphinx-build", "-b", "html", "src", "build"]
    res = script_runner.run(args, cwd=str(tmp_path))

    assert res.success
    assert build.exists()
    built = sorted(build.rglob("*"))
    print("\n".join(list(map(str, built))))
    static = build / "_static"
    assert (static / "prjsf/prjsf/prjsf.js").exists()
    if a_project not in NO_SCHEMA_JSON:
        assert (static / "pr-form/schema.json").exists()
