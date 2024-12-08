// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type { JSX } from 'react';

import Col from 'react-bootstrap/esm/Col.js';
import Container from 'react-bootstrap/esm/Container.js';
import Row from 'react-bootstrap/esm/Row.js';

import {
  FormContextType,
  ObjectFieldTemplateProps,
  RJSFSchema,
  StrictRJSFSchema,
  canExpand,
  descriptionId,
  getTemplate,
  getUiOptions,
  titleId,
} from '@rjsf/utils';

import Markdown from 'markdown-to-jsx';

import { UrljsfGridOptions } from '../_props.js';
import { emptyObject } from '../tokens.js';
import { useMarkdown } from '../utils.js';
import { MD_OPTIONS } from './markdown.js';

const DEFAULT_GRID_OPTIONS: UrljsfGridOptions = {
  default: ['col-12'],
  children: emptyObject as Record<string, string[]>,
  addButton: [],
};

export function ObjectGridTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  description,
  title,
  properties,
  required,
  uiSchema,
  idSchema,
  schema,
  formData,
  onAddClick,
  disabled,
  readonly,
  registry,
}: ObjectFieldTemplateProps<T, S, F>) {
  const uiOptions = getUiOptions<T, S, F>(uiSchema);
  const TitleFieldTemplate = getTemplate<'TitleFieldTemplate', T, S, F>(
    'TitleFieldTemplate',
    registry,
    uiOptions,
  );
  const DescriptionFieldTemplate = getTemplate<'DescriptionFieldTemplate', T, S, F>(
    'DescriptionFieldTemplate',
    registry,
    uiOptions,
  );
  // Button templates are not overridden in the uiSchema
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;

  const gridOptions: UrljsfGridOptions = {
    ...DEFAULT_GRID_OPTIONS,
    ...((uiOptions['urljsf:grid'] as any) || emptyObject),
  };

  const addButtonClasses = ['object-property-expand', ...gridOptions.addButton];

  let richDescription =
    description && useMarkdown(uiOptions) ? (
      <Markdown options={MD_OPTIONS}>{description}</Markdown>
    ) : (
      description
    );

  return (
    <>
      {title && (
        <TitleFieldTemplate
          id={titleId<T>(idSchema)}
          title={title}
          required={required}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      {richDescription && (
        <DescriptionFieldTemplate
          id={descriptionId<T>(idSchema)}
          description={richDescription}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <Container fluid className="p-0">
        <Row>
          {...properties.map(makeChild.bind(null, gridOptions))}
          {canExpand(schema, uiSchema, formData) ? (
            <Col className={addButtonClasses.join(' ')}>
              <AddButton
                onClick={onAddClick(schema)}
                disabled={disabled || readonly}
                className="object-property-expand"
                uiSchema={uiSchema}
                registry={registry}
              />
            </Col>
          ) : null}
        </Row>
      </Container>
    </>
  );
}

function makeChild(
  gridOptions: UrljsfGridOptions,
  element: any,
  index: number,
): JSX.Element {
  const classNames = [
    ...(element.hidden ? ['d-none'] : []),
    ...gridOptions.default,
    ...(gridOptions.children[element.name] || []),
  ];

  return (
    <Col key={index} className={classNames.join(' ')}>
      {element.content}
    </Col>
  );
}
