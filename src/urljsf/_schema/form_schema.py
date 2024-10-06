"""JSON Schema for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any

from ..props import schema


class HttpMethod(Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"


class Theme(Enum):
    bootstrap = "bootstrap"
    cerulean = "cerulean"
    cosmo = "cosmo"
    cyborg = "cyborg"
    darkly = "darkly"
    flatly = "flatly"
    journal = "journal"
    litera = "litera"
    lumen = "lumen"
    lux = "lux"
    materia = "materia"
    minty = "minty"
    morph = "morph"
    pulse = "pulse"
    quartz = "quartz"
    sandstone = "sandstone"
    simplex = "simplex"
    sketchy = "sketchy"
    slate = "slate"
    solar = "solar"
    spacelab = "spacelab"
    superhero = "superhero"
    united = "united"
    vapor = "vapor"
    yeti = "yeti"
    zephyr = "zephyr"


@dataclass
class Urljsf:
    url_template: str
    url_json_schema: str
    data_json_schema: str
    http_method: HttpMethod | None = HttpMethod.GET
    http_headers_template: str | None = None
    http_body_template: Any | None = None
    url_ui_schema: str | None = None
    data_ui_schema: str | None = None
    theme: Theme | None = Theme.bootstrap


UrljsfV0 = Urljsf


RsjfProps = schema.Model
