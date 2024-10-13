// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { CSSProperties } from 'react';

import Col from 'react-bootstrap/esm/Col.js';
import Row from 'react-bootstrap/esm/Row.js';

import {
  ArrayFieldTemplateItemType,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

export function ArrayFieldItemTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ArrayFieldTemplateItemType<T, S, F>) {
  const {
    children,
    disabled,
    hasToolbar,
    hasCopy,
    hasMoveDown,
    hasMoveUp,
    hasRemove,
    index,
    onCopyIndexClick,
    onDropIndexClick,
    onReorderClick,
    readonly,
    registry,
    uiSchema,
  } = props;
  const { CopyButton, MoveDownButton, MoveUpButton, RemoveButton } =
    registry.templates.ButtonTemplates;
  const btnStyle: CSSProperties = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold',
  };
  return (
    <div>
      <Row className="mb-2 d-flex align-items-center">
        <Col xs="1" lg="1" className="py-0">
          {hasToolbar && (
            <div className="d-flex flex-row flex-wrap justify-content-between">
              {(hasMoveUp || hasMoveDown) && (
                <div className="m-0 p-0">
                  <MoveUpButton
                    className="array-item-move-up"
                    style={btnStyle}
                    disabled={disabled || readonly || !hasMoveUp}
                    onClick={onReorderClick(index, index - 1)}
                    uiSchema={uiSchema}
                    registry={registry}
                  />
                </div>
              )}
              {(hasMoveUp || hasMoveDown) && (
                <div className="m-0 p-0">
                  <MoveDownButton
                    style={btnStyle}
                    disabled={disabled || readonly || !hasMoveDown}
                    onClick={onReorderClick(index, index + 1)}
                    uiSchema={uiSchema}
                    registry={registry}
                  />
                </div>
              )}
              {hasCopy && (
                <div className="m-0 p-0">
                  <CopyButton
                    style={btnStyle}
                    disabled={disabled || readonly}
                    onClick={onCopyIndexClick(index)}
                    uiSchema={uiSchema}
                    registry={registry}
                  />
                </div>
              )}
            </div>
          )}
        </Col>
        <Col xs="10" lg="10">
          {children}
        </Col>
        <Col xs="1" lg="1" className="py-0">
          {hasRemove && (
            <div className="m-0 p-0">
              <RemoveButton
                style={btnStyle}
                disabled={disabled || readonly}
                onClick={onDropIndexClick(index)}
                uiSchema={uiSchema}
                registry={registry}
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}
