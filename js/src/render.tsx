// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { Fragment, useState } from 'react';
import { render } from 'react-dom';

// import { Badge, Button, Col, Form, Row } from 'react-bootstrap';
import type { FormProps, IChangeEvent } from '@rjsf/core';
import { Form as RJSFForm } from '@rjsf/react-bootstrap';
// import type { RJSFValidationError } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import { Urljsf } from './_schema.js';
import { THEMES } from './themes.js';
import { DEBUG, DEFAULTS, emptyObject } from './tokens.js';
import { getConfig, getFileContent, getIdPrefix, initFormProps } from './utils.js';

/** process a single form
 *
 * @param container - a DOM script with urljsf
 */
export async function makeOneForm(script: HTMLScriptElement): Promise<void> {
  const config = await getConfig(script);
  const container = document.createElement('div');
  script.parentNode!.insertBefore(container, script);
  DEBUG && console.log(config);

  const [fileFormProps, urlFormProps] = await Promise.all([
    initFormProps(config.file_form),
    initFormProps(config.url_form),
  ]);

  const initFileValue = await getFileContent(config, fileFormProps.formData);

  const form = formComponent(config, initFileValue, fileFormProps, urlFormProps);
  const isolated = !!(config.iframe || config.iframe_style);
  render(isolated ? await renderIframe(config, form) : form, container);
}

/** a component for a form in a (themed) iframe
 *
 * @param dataset - the pre-processed dataset with defaults
 * @param form - the form element
 * @param container - a DOM node with urljsf dataset
 */
export async function renderIframe(
  config: Urljsf,
  form: JSX.Element,
): Promise<JSX.Element> {
  const { IFrame } = await import('./iframe.js');
  const anyTheme = THEMES as any;
  const { theme } = config;
  const themeFn = anyTheme[theme || 'bootstrap'] || THEMES.bootstrap;
  const cssUrl = (await themeFn()).default;
  const style = config.iframe_style || DEFAULTS.iframe_style;
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

/** a component for a branch option  */
// function branchOption(branch: string, idx: number): JSX.Element {
//   return <option key={idx}>{branch}</option>;
// }

/** a component for a file and URL form */
export function formComponent(
  config: Urljsf,
  initValue: string,
  fileFormProps: Partial<FormProps>,
  urlFormProps: Partial<FormProps>,
): JSX.Element {
  const URLJSF = () => {
    const idPrefix = getIdPrefix(config);
    // const filenamePattern = `${dataset.urljsfFileNamePattern || DEFAULTS.urljsfFileNamePattern}`;

    // const branches = (dataset.urljsfGitHubBranch || DEFAULTS.urljsfGitHubBranch)
    //   .trim()
    //   .split(' ');
    // const [value, setValue] = useState(initValue);
    // const [url, setUrl] = useState('#');
    // const [errors, setErrors] = useState<RJSFValidationError[]>([]);
    const [fileFormData, setFileFormData] = useState(fileFormProps.formData);
    const [urlFormData, setUrlFormData] = useState(urlFormProps.formData);
    // const [fileName, setFileName] = useState(dataset.urljsfFileName || '');
    // const [fileNameOk, setFileNameOk] = useState(!!fileName.match(filenamePattern));
    // const [branch, setBranch] = useState(branches[0]);

    const updateUrl = () => {
      // let gh = `${dataset.urljsfGitHubUrl}`.trim().replace(/\/$/, '');
      // let repo = `${dataset.urljsfGitHubRepo}`.trim();
      // let url = new URL(`${gh}/${repo}/new/${branch}`, window.location.href);
      // url.searchParams.set('value', value);
      // url.searchParams.set('fileName', fileName);
      // setUrl(url.toString());
      // setUrl('TODO');
    };

    const onFileFormChange = async (evt: IChangeEvent) => {
      let value = await getFileContent(config, evt.formData);
      // setValue(value);
      DEBUG && console.log('value', value);
      setFileFormData(evt.formData);
      // setErrors(evt.errors);
      updateUrl();
    };
    const onUrlFormChange = async (evt: IChangeEvent) => {
      // setValue(value);
      setUrlFormData(evt.formData);
      // setErrors(evt.errors);
      updateUrl();
    };

    // let branchEl: JSX.Element;
    // if (branches.length == 1) {
    //   branchEl = <code>{branch}</code>;
    // } else {
    //   branchEl = (
    //     <Form.Control
    //       as="select"
    //       size="sm"
    //       onChange={(e) => setBranch(e.currentTarget.value)}
    //     >
    //       {branches.map(branchOption)}
    //     </Form.Control>
    //   );
    // }

    // const badge = (
    //   <Badge pill className="bg-secondary badge-secondary">
    //     {dataset.urljsfGitHubRepo}
    //   </Badge>
    // );

    // let createButton: JSX.Element;

    // if (errors.length || !fileNameOk) {
    //   const errorEl = document.querySelector(`#${idPrefix} .has-error [id]`);
    //   const errorHref = errorEl ? `#${errorEl.id}` : '#';
    //   const errorCount = errors.length + (fileNameOk ? 0 : 1);

    //   createButton = (
    //     <Button as="a" size="sm" href={errorHref} variant="danger">
    //       {errorCount} Error{errorCount > 1 ? 's' : ''}
    //     </Button>
    //   );
    // } else {
    //   createButton = (
    //     <Button as="a" href={url} variant="primary" target="_blank">
    //       Start Pull Request
    //     </Button>
    //   );
    // }

    // let filenameClasses = ['font-monospace'];
    // let filenameEls: JSX.Element[] = [];

    // if (!fileNameOk) {
    //   filenameClasses.push('is-invalid');
    //   filenameEls.push(
    //     <span>
    //       should match <code>{filenamePattern}</code>
    //     </span>,
    //   );
    // }

    // const onFileNameChange = (value: string) => {
    //   setFileNameOk(!!value.match(filenamePattern));
    //   setFileName(value);
    //   updateUrl();
    // };

    // const fileNameInput = (
    //   <Form.Control
    //     size="sm"
    //     className={filenameClasses.join(' ')}
    //     value={fileName}
    //     pattern={filenamePattern}
    //     spellcheck={false}
    //     onChange={(change) => onFileNameChange(change.currentTarget.value)}
    //   />
    // );

    // const preview =
    //   value && fileNameOk && !errors.length
    //     ? [
    //         <code>
    //           <pre>{value}</pre>
    //         </code>,
    //       ]
    //     : [
    //         <blockquote>
    //           <i>
    //             No valid data for <code>{fileName}</code> yet
    //           </i>
    //         </blockquote>,
    //       ];

    return (
      <div class="urljsf-form">
        <div>
          <RJSFForm
            {...{
              schema: {},
              liveValidate: true,
              liveOmit: true,
              idPrefix: `${idPrefix}-`,
              id: idPrefix,
              ...((config.file_form.props || emptyObject) as any),
              ...fileFormProps,
              validator,
              onChange: onFileFormChange,
              formData: fileFormData,
            }}
          >
            <Fragment />
          </RJSFForm>
        </div>
        <hr />
        <div>
          <RJSFForm
            {...{
              schema: {},
              liveValidate: true,
              liveOmit: true,
              idPrefix: `${idPrefix}-url-`,
              id: `${idPrefix}-url`,
              ...((config.url_form.props || emptyObject) as any),
              ...urlFormProps,
              validator,
              onChange: onUrlFormChange,
              formData: urlFormData,
            }}
          >
            <Fragment />
          </RJSFForm>
        </div>
        {/* <div>
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
        <hr /> */}
      </div>
    );
  };

  return <URLJSF />;
}
