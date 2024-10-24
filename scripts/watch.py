"""Watch all the things."""

import atexit
import os
import sys
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
    procs = [psutil.Popen(["pixi", "r", tn], env=env) for tn in watch_tasks]

    def stop():
        [p.terminate(recursive=True) for p in procs]

    atexit.register(stop)

    try:
        psutil.wait_procs(procs)
    except KeyboardInterrupt:
        stop()
    finally:
        stop()
    return 0


if __name__ == "__main__":
    sys.exit(main())
