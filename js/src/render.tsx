// Copyright (C) prjsf contributors.
// Distributed under the terms of the Modified BSD License.

import type { FormProps, IChangeEvent } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { Fragment, render } from 'react-dom';
import { useState } from 'react';
import { Form as RJSFForm } from '@rjsf/react-bootstrap';
import { Form, Badge, Button, Col, Row } from 'react-bootstrap';

import { DEFAULTS, type TDataSet } from './tokens.js';

import { fetchData, getFileContent, getDataSet } from './utils.js';
import { RJSFValidationError } from '@rjsf/utils';

let _NEXT_DATA_SET = 0;
let _DATA_SETS = new WeakMap<TDataSet, number>();

export async function makeOneForm(container: HTMLElement): Promise<void> {
  const dataset = getDataSet(container);

  const [schema, uiSchema, formData] = await Promise.all([
    fetchData(dataset, 'prjsfSchema'),
    fetchData(dataset, 'prjsfUiSchema'),
    fetchData(dataset, 'prjsfData'),
  ]);

  const form = formComponent(dataset, { schema, formData, uiSchema });
  render(form, container);
}

function makeOneBranchOption(branch: string, idx: number) {
  return <option key={idx}>{branch}</option>;
}

export function formComponent(dataset: TDataSet, props: Partial<FormProps>) {
  const PRJSF = () => {
    if (!_DATA_SETS.has(dataset)) {
      _DATA_SETS.set(dataset, _NEXT_DATA_SET++);
    }
    const idPrefix = dataset.prjsfIdPrefix || `prjsf-${_DATA_SETS.get(dataset)}`;

    const branches = `${dataset.prjsfGitHubBranch || DEFAULTS.prjsfGitHubBranch}`
      .trim()
      .split(' ');
    const [value, setValue] = useState('');
    const [url, setUrl] = useState('#');
    const [errors, setErrors] = useState<RJSFValidationError[]>([]);
    const [formData, setFormData] = useState(props.formData);
    const [fileName, setFileName] = useState(dataset.prjsfFileName || '');
    const [branch, setBranch] = useState(branches[0]);

    const updateUrl = () => {
      let gh = `${dataset.prjsfGitHubUrl}`.trim().replace(/\/$/, '');
      let repo = `${dataset.prjsfGitHubRepo}`.trim();
      let url = new URL(`${gh}/${repo}/new/${branch}`, window.location.href);
      url.searchParams.set('value', value);
      url.searchParams.set('fileName', fileName);
      setUrl(url.toString());
    };

    const onChange = async (evt: IChangeEvent) => {
      let value = await getFileContent(dataset, evt.formData);
      setValue(value);
      setFormData(evt.formData);
      setErrors(evt.errors);
      updateUrl();
    };

    const formProps: FormProps = {
      schema: {},
      validator,
      liveValidate: true,
      idPrefix: `${idPrefix}-`,
      id: idPrefix,
      onChange,
      ...props,
    };

    let branchEl: JSX.Element;
    if (branches.length == 1) {
      branchEl = <code>{branch}</code>;
    } else {
      branchEl = (
        <Form.Control
          as="select"
          size="sm"
          onChange={(e) => setBranch(e.currentTarget.value)}
        >
          {branches.map(makeOneBranchOption)}
        </Form.Control>
      );
    }

    const badge = (
      <Badge pill className="bg-secondary badge-secondary">
        <i className="fab fa-github"></i> {dataset.prjsfGitHubRepo}
      </Badge>
    );

    let createButton: JSX.Element;

    if (errors.length) {
      const errorEl = document.querySelector(`#${idPrefix} .has-error [id]`);
      const errorHref = errorEl ? `#${errorEl.id}` : '#';

      createButton = (
        <Button as="a" size="sm" href={errorHref} variant="danger">
          <i class="fa fa-triangle-exclamation"></i> {errors.length} error
          {errors.length > 1 ? 's' : ''}
        </Button>
      );
    } else {
      createButton = (
        <Button as="a" href={url} variant="primary" target="_blank">
          <i class="fa fa-code-pull-request"></i> Start Pull Request
        </Button>
      );
    }

    const fileNameInput = (
      <Form.Control
        size="sm"
        className="font-monospace"
        placeholder={fileName}
        onChange={(change) => {
          setFileName(change.currentTarget.value);
          updateUrl();
        }}
      />
    );

    const preview = value
      ? [
          <code>
            <pre>{value}</pre>
          </code>,
        ]
      : [
          <blockquote>
            <i>
              No valid data for <code>{fileName}</code> yet
            </i>
          </blockquote>,
        ];

    return (
      <div class="prjsf-pr-form">
        <div>
          <RJSFForm {...formProps} formData={formData}>
            <Fragment />
          </RJSFForm>
        </div>
        <hr />
        <div>
          <Row>
            <Col>
              <Form.Text>repo</Form.Text>
              <br />
              {badge}
            </Col>
            <Col>
              <Form.Text>branch</Form.Text>
              <br />
              {branchEl}
            </Col>
            <Col>
              <Form.Text>path</Form.Text>
              {fileNameInput}
            </Col>
            <Col style="text-align:right;">
              <br />
              {createButton}
            </Col>
          </Row>
        </div>
        <hr />
        <div>
          <label>
            <code>{fileName}</code>
          </label>
          {preview}
        </div>
        <hr />
      </div>
    );
  };

  return <PRJSF />;
}
