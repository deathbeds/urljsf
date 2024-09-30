"""Verify behavior when run under ``sphinx-build``."""

# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from pathlib import Path

from pytest_console_scripts import ScriptRunner


def test_sphinx(a_project: Path, script_runner: ScriptRunner, tmp_path: Path) -> None:
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
    assert (static / "pr-form/schema.json").exists()
