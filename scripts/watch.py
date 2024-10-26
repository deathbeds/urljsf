"""Watch all the things."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

import atexit
import os
import sys
import time
from pathlib import Path

import psutil
import tomllib

HERE = Path(__file__).parent
ROOT = HERE.parent

PXT = ROOT / "pixi.toml"


def main() -> int:
    """Run all the watchers."""
    env = dict(os.environ)
    env.pop("PIXI_ENVIRONMENT_NAME")
    pxd = tomllib.loads(PXT.read_text(encoding="utf-8"))
    watch_tasks = [
        tn
        for ft in pxd["feature"].values()
        for tn, t in ft.get("tasks", {}).items()
        if tn.startswith("watch-")
    ]
    procs: dict[str, psutil.Popen] = {
        tn: psutil.Popen(["pixi", "r", tn], env=env) for tn in watch_tasks
    }

    def stop() -> None:
        for proc in procs.values():
            for p in [*proc.children(recursive=True), proc]:
                if p.is_running():
                    p.terminate()

    atexit.register(stop)

    try:
        while True:
            running = []
            not_running = []
            for tn, proc in procs.items():
                if proc.is_running():
                    running.append(tn)
                else:
                    not_running.append(tn)
            if not not_running:
                print("... all watchers running", time.time())
            else:
                print("!!! NOT running", *not_running)
            time.sleep(10)
    except KeyboardInterrupt:
        stop()
    finally:
        stop()
    return 0


if __name__ == "__main__":
    sys.exit(main())
