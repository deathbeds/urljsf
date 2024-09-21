"""Tests of packaging metadata."""
# Copyright (C) prjsf contributors.


def test_version() -> None:
    """Verify version the version is present."""
    from prjsf import __version__

    assert __version__
