"""Acceptance tests for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

import os
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent
ATEST = ROOT / "atest"
SUITES = ATEST / "suites"
BUILD = ROOT / "build"
REPORTS = ROOT / "build/reports"
ATEST_OUT = REPORTS / "atest"


def main() -> int:
    """Run acceptance tests."""
    args: list[str | Path | int] = ["pabot"]
    args += ["--artifacts", "png,log,json", "--artifactsinsubfolders"]
    env = dict(os.environ)
    env.update(
        ROOT=f"{ROOT}",
        MOZ_HEADLESS="1",
        FIREFOX=which("firefox"),
        GECKODRIVER=which("geckodriver"),
    )
    args += [SUITES]
    str_args = list(map(str, args))
    print("in", ATEST_OUT, "\n>>>", *args)
    if ATEST_OUT.exists():
        shutil.rmtree(ATEST_OUT)
    ATEST_OUT.mkdir(parents=True)
    return subprocess.call(str_args, cwd=f"{ATEST_OUT}", env=env)


def which(what: str) -> str:
    """Get an executable."""
    for candidate in [what, f"{what}.exe"]:
        where = shutil.which(candidate)
        if where:
            return where
    msg = f"no {what} found"
    raise RuntimeError(msg)


if __name__ == "__main__":
    sys.exit(main())
