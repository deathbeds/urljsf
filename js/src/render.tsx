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

  const initValue = await getFileContent(dataset, formData);
  console.error(initValue);

  const form = formComponent(dataset, initValue, { schema, formData, uiSchema });
  render(form, container);
}

function makeOneBranchOption(branch: string, idx: number) {
  return <option key={idx}>{branch}</option>;
}

export function formComponent(
  dataset: TDataSet,
  initValue: string,
  props: Partial<FormProps>,
) {
  const PRJSF = () => {
    if (!_DATA_SETS.has(dataset)) {
      _DATA_SETS.set(dataset, _NEXT_DATA_SET++);
    }
    const idPrefix = dataset.prjsfIdPrefix || `prjsf-${_DATA_SETS.get(dataset)}`;
    const filenamePattern = `${dataset.prjsfFileNamePattern || DEFAULTS.prjsfFileNamePattern}`;

    const branches = (dataset.prjsfGitHubBranch || DEFAULTS.prjsfGitHubBranch)
      .trim()
      .split(' ');
    const [value, setValue] = useState(initValue);
    const [url, setUrl] = useState('#');
    const [errors, setErrors] = useState<RJSFValidationError[]>([]);
    const [formData, setFormData] = useState(props.formData);
    const [fileName, setFileName] = useState(dataset.prjsfFileName || '');
    const [fileNameOk, setFileNameOk] = useState(!!fileName.match(filenamePattern));
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
        {dataset.prjsfGitHubRepo}
      </Badge>
    );

    let createButton: JSX.Element;

    if (errors.length || !fileNameOk) {
      const errorEl = document.querySelector(`#${idPrefix} .has-error [id]`);
      const errorHref = errorEl ? `#${errorEl.id}` : '#';
      const errorCount = errors.length + (fileNameOk ? 0 : 1);

      createButton = (
        <Button as="a" size="sm" href={errorHref} variant="danger">
          {errorCount} Error{errorCount > 1 ? 's' : ''}
        </Button>
      );
    } else {
      createButton = (
        <Button as="a" href={url} variant="primary" target="_blank">
          Start Pull Request
        </Button>
      );
    }

    let filenameClasses = ['font-monospace'];
    let filenameEls: JSX.Element[] = [];

    if (!fileNameOk) {
      filenameClasses.push('is-invalid');
      filenameEls.push(
        <span>
          should match <code>{filenamePattern}</code>
        </span>,
      );
    }

    const onFileNameChange = (value: string) => {
      setFileNameOk(!!value.match(filenamePattern));
      setFileName(value);
      updateUrl();
    };

    const fileNameInput = (
      <Form.Control
        size="sm"
        className={filenameClasses.join(' ')}
        value={fileName}
        pattern={filenamePattern}
        spellcheck={false}
        onChange={(change) => onFileNameChange(change.currentTarget.value)}
      />
    );

    const preview =
      value && fileNameOk && !errors.length
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
          <label>{fileNameInput} {...filenameEls}</label>
          <br />
          {preview}
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
              <br />
              <code>{fileName}</code>
            </Col>
            <Col style="text-align:right;">
              <br />
              {createButton}
            </Col>
          </Row>
        </div>
        <hr />
      </div>
    );
  };

  return <PRJSF />;
}
