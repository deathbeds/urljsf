"""Test configuration for ``prjsf``."""
# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import os
from typing import TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from collections.abc import Generator
    from pathlib import Path


WIN = os.name == "win32"
SEP = ";" if WIN else ":"


pytest_plugins = ("sphinx.testing.fixtures",)


@pytest.fixture
def py_tmp_path(tmp_path: Path) -> Generator[Path, None, None]:
    """Wrap a temporary directory added to ``PYTHONPATH``."""
    var_name = "PYTHONPATH"
    old_py_path = os.environ.get(var_name)

    new_py_path = str(tmp_path.resolve())
    if old_py_path:
        new_py_path = SEP.join([new_py_path, old_py_path])
    os.environ[var_name] = new_py_path
    yield tmp_path
    if old_py_path:
        os.environ[var_name] = old_py_path
    else:
        os.environ.pop(var_name)
