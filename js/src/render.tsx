// Copyright (C) prjsf contributors.
// Distributed under the terms of the Modified BSD License.
import { createPortal, useState } from 'react';
import { Fragment, render } from 'react-dom';

import { Badge, Button, Col, Form, Row } from 'react-bootstrap';

import type { FormProps, IChangeEvent } from '@rjsf/core';
import { Form as RJSFForm } from '@rjsf/react-bootstrap';
import type { RJSFValidationError } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import { THEMES } from './themes.js';
import { DEFAULTS, type TDataSet } from './tokens.js';
import { fetchData, getDataSet, getFileContent, getIdPrefix } from './utils.js';

/** process a single form
 *
 * @param container - a DOM node with prjsf dataset
 */
export async function makeOneForm(container: HTMLElement): Promise<void> {
  const dataset = getDataSet(container);

  const [schema, uiSchema, formData] = await Promise.all([
    fetchData(dataset, 'prjsfSchema'),
    fetchData(dataset, 'prjsfUiSchema'),
    fetchData(dataset, 'prjsfData'),
  ]);

  const initValue = await getFileContent(dataset, formData);
  const form = formComponent(dataset, initValue, { schema, formData, uiSchema });
  const isolated = !!dataset.prjsfIframe;
  render(isolated ? await renderIframe(dataset, form) : form, container);
}

/** a component for a form in a (themed) iframe
 *
 * @param dataset - the pre-processed dataset with defaults
 * @param form - the form element
 * @param container - a DOM node with prjsf dataset
 */
async function renderIframe(
  dataset: TDataSet,
  form: JSX.Element,
): Promise<JSX.Element> {
  const anyTheme = THEMES as any;
  const { prjsfTheme } = dataset;
  const themeFn = anyTheme[prjsfTheme || DEFAULTS.prjsfTheme] || THEMES.bootstrap;
  const cssUrl = (await themeFn()).default;
  const style = dataset.prjsfIframeStyle || DEFAULTS.prjsfIframeStyle;
  return (
    <IFrame style={style}>
      <head>
        <link rel="stylesheet" href={cssUrl}></link>
      </head>
      <div class="col-lg-8 mx-auto p-3 py-md-5">
        <main class="bs-main">
          <div class="bs-content">
            <div class="bs-article-container">
              <section>{form}</section>
            </div>
          </div>
        </main>
      </div>
    </IFrame>
  );
}

/** an interface for iframe props */
interface IFrameProps {
  children: JSX.Element | JSX.Element[];
  style?: string;
}

/** an iframe component for isolating CSS */
function IFrame(props: IFrameProps): JSX.Element {
  const [ref, setRef] = useState<HTMLIFrameElement>();
  const container = ref?.contentWindow?.document?.body;

  return (
    <iframe ref={setRef as any} {...props}>
      {container && createPortal(props.children, container)}
    </iframe>
  );
}

/** a component for a branch option  */
function branchOption(branch: string, idx: number): JSX.Element {
  return <option key={idx}>{branch}</option>;
}

/** a component for a form */
export function formComponent(
  dataset: TDataSet,
  initValue: string,
  props: Partial<FormProps>,
): JSX.Element {
  const PRJSF = () => {
    const idPrefix = getIdPrefix(dataset);
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
          {branches.map(branchOption)}
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
      <div class="prjsf-form">
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
