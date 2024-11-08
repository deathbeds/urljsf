"""Acceptance tests for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import asyncio
import logging
import shutil
import socket
import sys
import tempfile
from pathlib import Path

from tornado import httpserver, log, web


async def start_http_server(port: int, path: str) -> None:
    """Run an http server."""

    class StaticHandler(web.StaticFileHandler):
        def parse_url_path(self, url_path: str) -> str:
            url_path = super().parse_url_path(url_path=url_path)
            if not url_path or url_path.endswith("/"):
                url_path = f"{url_path}/index.html"
            return url_path

    class ShutdownHandler(web.RequestHandler):
        def get(self) -> None:
            stopped.set()

    app = web.Application(
        [
            ("^/shutdown$", ShutdownHandler),
            ("^/(.*)", StaticHandler, {"path": path}),
        ],
        debug=True,
        settings={"compress_response": True},
    )
    http_server = httpserver.HTTPServer(app)
    http_server.listen(port)
    log.access_log.setLevel(logging.DEBUG)
    log.app_log.warning("[%s] serving %s", port, path)
    stopped = asyncio.Event()
    await stopped.wait()
    http_server.stop()
    await http_server.close_all_connections()


def get_unused_port() -> int:
    """Find an unused network port (could still create race conditions)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("localhost", 0))
    s.listen(1)
    port = s.getsockname()[1]
    s.close()
    if not isinstance(port, int):
        msg = f"don't know what to do with port {port}"
        raise TypeError(msg)
    return port


def main(argv: list[str] | None = None) -> int:
    """Parse args and run the server until shutdown."""
    port, static, patch, dist_cov = argv or sys.argv[1:]

    with tempfile.TemporaryDirectory() as td:
        tdp = Path(td)
        www = tdp / "www"
        assets = www / patch
        shutil.copytree(static, www)
        shutil.rmtree(assets)
        shutil.copytree(dist_cov, assets)

        asyncio.new_event_loop().run_until_complete(
            start_http_server(int(port), str(www))
        )

        shutil.rmtree(td, ignore_errors=True)

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
