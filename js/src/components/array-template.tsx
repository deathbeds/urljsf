// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import Col from 'react-bootstrap/esm/Col.js';
import Container from 'react-bootstrap/esm/Container.js';
import Row from 'react-bootstrap/esm/Row.js';

import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  getTemplate,
  getUiOptions,
} from '@rjsf/utils';

import Markdown from 'markdown-to-jsx';

import { useMarkdown } from '../utils.js';
import { MD_OPTIONS } from './markdown.js';

export function ArrayFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ArrayFieldTemplateProps<T, S, F>) {
  const {
    canAdd,
    disabled,
    idSchema,
    uiSchema,
    items,
    onAddClick,
    readonly,
    registry,
    required,
    schema,
    title,
  } = props;
  const uiOptions = getUiOptions<T, S, F>(uiSchema);
  const ArrayFieldDescriptionTemplate = getTemplate<
    'ArrayFieldDescriptionTemplate',
    T,
    S,
    F
  >('ArrayFieldDescriptionTemplate', registry, uiOptions);
  const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate', T, S, F>(
    'ArrayFieldItemTemplate',
    registry,
    uiOptions,
  );
  const ArrayFieldTitleTemplate = getTemplate<'ArrayFieldTitleTemplate', T, S, F>(
    'ArrayFieldTitleTemplate',
    registry,
    uiOptions,
  );
  // Button templates are not overridden in the uiSchema
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;

  const description = uiOptions.description || schema.description;

  let richDescription =
    description && useMarkdown(uiOptions) ? (
      <Markdown options={MD_OPTIONS}>{description}</Markdown>
    ) : (
      description
    );

  return (
    <div>
      <Row className="p-0 m-0">
        <Col className="p-0 m-0">
          <ArrayFieldTitleTemplate
            idSchema={idSchema}
            title={uiOptions.title || title}
            schema={schema}
            uiSchema={uiSchema}
            required={required}
            registry={registry}
          />
          <ArrayFieldDescriptionTemplate
            idSchema={idSchema}
            description={richDescription}
            schema={schema}
            uiSchema={uiSchema}
            registry={registry}
          />
          <Container fluid key={`array-item-list-${idSchema.$id}`} className="p-0 m-0">
            <Row>
              <Col xs={12}>
                {items &&
                  items.map(
                    ({ key, ...itemProps }: ArrayFieldTemplateItemType<T, S, F>) => (
                      <ArrayFieldItemTemplate key={key} {...itemProps} />
                    ),
                  )}
              </Col>
            </Row>
            {canAdd && (
              <Row>
                <Col xs={12} className="py-0">
                  <AddButton
                    className="array-item-add align-bottom"
                    onClick={onAddClick}
                    disabled={disabled || readonly}
                    uiSchema={uiSchema}
                    registry={registry}
                    title={uiSchema?.title || schema.title || title}
                  />
                </Col>
              </Row>
            )}
          </Container>
        </Col>
      </Row>
    </div>
  );
}
