"""JSON Schema for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any

Model = Any


class Desired(Enum):
    translateString = "translateString"
    transformErrors = "transformErrors"
    extraErrors = "extraErrors"
    customValidate = "customValidate"
    widgets = "widgets"
    templates = "templates"
    fields = "fields"


class Ignored(Enum):
    validator = "validator"
    children = "children"
    experimental_defaultFormStateBehavior = "experimental_defaultFormStateBehavior"
    field_internalFormWrapper = "_internalFormWrapper"
    ref = "ref"
    onFocus = "onFocus"
    onBlur = "onBlur"
    onSubmit = "onSubmit"
    onError = "onError"
    onChange = "onChange"
    noValidate = "noValidate"
    acceptcharset = "acceptcharset"


class Included(Enum):
    acceptCharset = "acceptCharset"
    action = "action"
    autoComplete = "autoComplete"
    className = "className"
    disabled = "disabled"
    enctype = "enctype"
    extraErrorsBlockSubmit = "extraErrorsBlockSubmit"
    id = "id"
    idPrefix = "idPrefix"
    idSeparator = "idSeparator"
    liveOmit = "liveOmit"
    liveValidate = "liveValidate"
    method = "method"
    name = "name"
    noHtml5Validate = "noHtml5Validate"
    omitExtraData = "omitExtraData"
    readonly = "readonly"
    showErrorList = "showErrorList"
    target = "target"


@dataclass(slots=True)
class Overloads:
    """simplifications of important fields which are out of scope to fully support inline.
    """

    focusOnFirstError: bool
    formContext: dict[str, Any]
    formData: dict[str, Any]
    schema_: dict[str, Any]
    tagName: str
    uiSchema: dict[str, Any]


class ShowErrorList(Enum):
    """When this prop is set to `top` or 'bottom', a list of errors (or the custom error list defined in the `ErrorList`) will also show. When set to false, only inline input validation errors will be shown. Set to `top` by default
    """

    bool_False = False
    top = "top"
    bottom = "bottom"


@dataclass(slots=True)
class Props:
    """JSON-compatible default values for `rjsf` [`Form.props`][form-props].

    [form-props]: https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props
    """

    acceptCharset: str | None = None
    action: str | None = None
    autoComplete: str | None = None
    className: str | None = None
    disabled: bool | None = None
    enctype: str | None = None
    extraErrorsBlockSubmit: bool | None = None
    focusOnFirstError: bool | None = None
    formContext: dict[str, Any] | None = None
    formData: dict[str, Any] | None = None
    id: str | None = None
    idPrefix: str | None = None
    idSeparator: str | None = None
    liveOmit: bool | None = None
    liveValidate: bool | None = None
    method: str | None = None
    name: str | None = None
    noHtml5Validate: bool | None = None
    omitExtraData: bool | None = None
    readonly: bool | None = None
    schema_: dict[str, Any] | None = None
    showErrorList: ShowErrorList | None = None
    tagName: str | None = None
    target: str | None = None
    uiSchema: dict[str, Any] | None = None
