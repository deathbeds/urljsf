"""JSON Schema for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict


class ShowErrorList(Enum):
    bool_False = False
    top = "top"
    bottom = "bottom"


@dataclass
class Model:
    acceptCharset: str | None = None
    acceptcharset: str | None = None
    action: str | None = None
    autoComplete: str | None = None
    className: str | None = None
    disabled: bool | None = None
    enctype: str | None = None
    extraErrorsBlockSubmit: bool | None = None
    focusOnFirstError: bool | None = None
    formContext: Dict[str, Any] | None = None
    formData: Dict[str, Any] | None = None
    id: str | None = None
    idPrefix: str | None = None
    idSeparator: str | None = None
    liveOmit: bool | None = None
    liveValidate: bool | None = None
    method: str | None = None
    name: str | None = None
    noHtml5Validate: bool | None = None
    noValidate: bool | None = None
    omitExtraData: bool | None = None
    readonly: bool | None = None
    schema_: Dict[str, Any] | None = None
    showErrorList: ShowErrorList | None = None
    tagName: str | None = None
    target: str | None = None
    uiSchema: Dict[str, Any] | None = None
