// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { Fragment, useState } from 'react';
import { render } from 'react-dom';

import { Button } from 'react-bootstrap';

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
 * @param script - a DOM script with a urljsf mime type
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

/** a component for a form in a (themed) iframe */
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
    };

    const onUrlFormChange = async ({ formData, errors }: IChangeEvent) => {
      setUrlFormData(formData);
      setUrlErrors(errors);
      updateUrl();
    };

    let errors = [...fileErrors, ...urlErrors];

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

    const formPreDefaults = { schema: {}, liveValidate: true, liveOmit: true };
    const formPostDefaults = { validator };

    const finalFileFormProps = {
      ...formPreDefaults,
      idPrefix: `${idPrefix}-file-`,
      id: `${idPrefix}-file`,
      ...((config.file_form.props || emptyObject) as any),
      ...fileFormProps,
      onChange: onFileFormChange,
      formData: fileFormData,
      ...formPostDefaults,
    };

    const finalUrlFormProps = {
      ...formPreDefaults,
      idPrefix: `${idPrefix}-url-`,
      id: `${idPrefix}-url`,
      ...((config.url_form.props || emptyObject) as any),
      ...urlFormProps,
      onChange: onUrlFormChange,
      formData: urlFormData,
      ...formPostDefaults,
    };

    return (
      <div className={FORM_CLASS} id={idPrefix}>
        <div>
          <RJSFForm {...finalFileFormProps}>
            <Fragment />
          </RJSFForm>
        </div>
        <hr />
        <div>{preview}</div>
        <hr />
        <div>
          <RJSFForm {...finalUrlFormProps}>
            <Fragment />
          </RJSFForm>
        </div>
        <hr />
        {createButton}
      </div>
    );
  };

  return <URLJSF />;
}

/** handle scrolling to an element (maybe in an iframe) */
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
