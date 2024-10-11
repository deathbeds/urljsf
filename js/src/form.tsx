// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { Fragment } from 'react';
import { render } from 'react-dom';

import Button from 'react-bootstrap/esm/Button.js';

import type { FormProps, IChangeEvent } from '@rjsf/core';
import { Form as RJSFForm } from '@rjsf/react-bootstrap';
import type { RJSFValidationError } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import { batch, computed, signal } from '@preact/signals';
import type Nunjucks from 'nunjucks';

import { Urljsf } from './_schema.js';
import { ensureNunjucks } from './nunjucks.js';
import { DEFAULTS, FORM_CLASS, emptyObject } from './tokens.js';
import { getConfig, getFileContent, getIdPrefix, initFormProps } from './utils.js';

interface IErrors {
  url: RJSFValidationError[];
  file: RJSFValidationError[];
}

interface IContext {
  config: Urljsf;
  url: Record<string, any>;
  file: Record<string, any>;
  text: string;
}

interface IFormProps {
  config: Urljsf;
  initText: string;
  fileFormProps: Partial<FormProps>;
  urlFormProps: Partial<FormProps>;
  nunjucks: typeof Nunjucks;
}

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

  const [nunjucks, initText] = await Promise.all([
    ensureNunjucks(),
    getFileContent(config, fileFormProps.formData),
  ]);

  const form = formComponent({
    config,
    initText,
    fileFormProps,
    urlFormProps,
    nunjucks,
  });
  const isolated = !!(config.iframe || config.iframe_style);
  render(isolated ? await renderIframe(config, form) : form, container);
}

/** a component for a form in a (themed) iframe */
async function renderIframe(config: Urljsf, form: JSX.Element): Promise<JSX.Element> {
  const { IFrame } = await import('./iframe.js');
  const cssUrl = (await import('bootstrap/dist/css/bootstrap.min.css')).default;
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
function formComponent(props: IFormProps): JSX.Element {
  const { config, initText, fileFormProps, urlFormProps, nunjucks } = props;
  const idPrefix = getIdPrefix(config);
  const initContext: IContext = {
    config,
    url: urlFormProps.formData,
    file: fileFormProps.formData,
    text: initText,
  };
  const initErrors: IErrors = { url: [], file: [] };
  const text = signal(initText);
  const context = signal(initContext);
  const errors = signal(initErrors);

  const errorCount = computed(() => [...errors.value.file, ...errors.value.url].length);
  const url = computed(() =>
    nunjucks.renderString(config.url_template, context.value).replace('\n', ''),
  );

  const URLJSF = () => {
    const onFileFormChange = async (evt: IChangeEvent) => {
      const value = await getFileContent(config, evt.formData);
      batch(() => {
        text.value = value;
        context.value = { ...context.value, file: evt.formData };
        errors.value = { ...errors.value, file: evt.errors };
      });
    };

    const onUrlFormChange = async (evt: IChangeEvent) => {
      batch(() => {
        context.value = { ...context.value, url: evt.formData };
        errors.value = { ...errors.value, url: evt.errors };
      });
    };

    let createButton: JSX.Element;
    if (errorCount.value) {
      createButton = (
        <Button size="lg" onClick={onErrorClick} variant="danger">
          {errorCount} Error{errorCount.value > 1 ? 's' : ''}
        </Button>
      );
    } else {
      createButton = (
        <Button size="lg" as="a" href={url.value} variant="primary" target="_blank">
          Start Pull Request
        </Button>
      );
    }

    const preview = text.value
      ? [
          <code>
            <pre>{text.value}</pre>
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
      formData: context.value.file,
      ...formPostDefaults,
    };

    const finalUrlFormProps = {
      ...formPreDefaults,
      idPrefix: `${idPrefix}-url-`,
      id: `${idPrefix}-url`,
      ...((config.url_form.props || emptyObject) as any),
      ...urlFormProps,
      onChange: onUrlFormChange,
      formData: context.value.url,
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
    const top = errorEl.getBoundingClientRect().top + win.scrollY;
    win.scrollTo({ top, behavior: 'smooth' });
  }
}
