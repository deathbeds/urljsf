// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { Fragment, useState } from 'react';
import { render } from 'react-dom';

import {
  Button,
  /*Badge, Col, Form, Row*/
} from 'react-bootstrap';

import type { FormProps, IChangeEvent } from '@rjsf/core';
import { Form as RJSFForm } from '@rjsf/react-bootstrap';
import type { RJSFValidationError } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import { Urljsf } from './_schema.js';
import { THEMES } from './themes.js';
import { DEBUG, DEFAULTS, FORM_CLASS, emptyObject } from './tokens.js';
import { getConfig, getFileContent, getIdPrefix, initFormProps } from './utils.js';

/** process a single form
 *
 * @param container - a DOM script with urljsf
 */
export async function makeOneForm(script: HTMLScriptElement): Promise<void> {
  const config = await getConfig(script);
  const container = document.createElement('div');
  script.parentNode!.insertBefore(container, script);

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
async function renderIframe(config: Urljsf, form: JSX.Element): Promise<JSX.Element> {
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

function onErrorClick(evt: MouseEvent) {
  const target = evt.currentTarget as HTMLElement;
  const parent = target.closest(`.${FORM_CLASS}`) as HTMLDivElement;
  const win = parent?.ownerDocument.defaultView as Window;
  const errorEl = parent?.querySelector('.has-error');
  if (errorEl && win) {
    DEBUG && console.warn(errorEl);
    const top = errorEl.getBoundingClientRect().top + win.scrollY;
    DEBUG && console.warn(top);
    win.scrollTo({ top, behavior: 'smooth' });
  }
}

/** a component for a file and URL form */
function formComponent(
  config: Urljsf,
  initValue: string,
  fileFormProps: Partial<FormProps>,
  urlFormProps: Partial<FormProps>,
): JSX.Element {
  const URLJSF = () => {
    const idPrefix = getIdPrefix(config);
    const [value, setValue] = useState(initValue);
    const [url, setUrl] = useState('#');
    const [fileErrors, setFileErrors] = useState<RJSFValidationError[]>([]);
    const [urlErrors, setUrlErrors] = useState<RJSFValidationError[]>([]);
    const [fileFormData, setFileFormData] = useState(fileFormProps.formData);
    const [urlFormData, setUrlFormData] = useState(urlFormProps.formData);

    const updateUrl = () => {
      // let gh = `${dataset.urljsfGitHubUrl}`.trim().replace(/\/$/, '');
      // let repo = `${dataset.urljsfGitHubRepo}`.trim();
      // let url = new URL(`${gh}/${repo}/new/${branch}`, window.location.href);
      // url.searchParams.set('value', value);
      // url.searchParams.set('fileName', fileName);
      // setUrl(url.toString());
      setUrl('#');
    };

    const onFileFormChange = async ({ formData, errors }: IChangeEvent) => {
      let value = await getFileContent(config, formData);
      setValue(value);
      setFileFormData(formData);
      setFileErrors(errors);
      updateUrl();
      DEBUG && console.warn(value);
    };

    const onUrlFormChange = async ({ formData, errors }: IChangeEvent) => {
      setUrlFormData(formData);
      setUrlErrors(errors);
      updateUrl();
    };

    let errors = [...fileErrors, ...urlErrors];
    DEBUG && console.error(...errors);

    let createButton: JSX.Element;

    if (errors.length) {
      const errorCount = errors.length;

      createButton = (
        <Button size="sm" onClick={onErrorClick} variant="danger">
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

    const preview = value
      ? [
          <code>
            <pre>{value}</pre>
          </code>,
        ]
      : [
          <blockquote>
            <i>No valid file data yet</i>
          </blockquote>,
        ];

    return (
      <div className={FORM_CLASS} id={idPrefix}>
        <div>
          <RJSFForm
            {...{
              schema: {},
              liveValidate: true,
              liveOmit: true,
              idPrefix: `${idPrefix}-file-`,
              id: `${idPrefix}-file`,
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
        <hr />
        <div>{preview}</div>
        <hr />
        {/* <div>
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
            </Col>
          </Row>
        </div>
        <hr /> */}
        {createButton}
      </div>
    );
  };

  return <URLJSF />;
}
