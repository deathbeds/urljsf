// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { Fragment } from 'react';
import { render } from 'react-dom';

import Button from 'react-bootstrap/esm/Button.js';
import { ButtonProps } from 'react-bootstrap/esm/Button.js';

import type { FormProps, IChangeEvent } from '@rjsf/core';
import { Form as RJSFForm } from '@rjsf/react-bootstrap';
import validator from '@rjsf/validator-ajv8';

import { ReadonlySignal, batch, computed, signal } from '@preact/signals';
import Markdown from 'markdown-to-jsx';
import type { MarkdownToJSX } from 'markdown-to-jsx';

import { Urljsf } from '../_schema.js';
import { ensureBootstrap, getBoostrapCss } from '../bootstrap.js';
import { ensureNunjucks, renderMarkdown, renderUrl } from '../nunjucks.js';
import {
  DEFAULTS,
  FORM_CLASS,
  IContext,
  IErrors,
  IFormProps,
  emptyObject,
} from '../tokens.js';
import { getConfig, getFileContent, getIdPrefix, initFormProps } from '../utils.js';
import { CheckItem } from './check-item.js';
import { Style } from './style.js';

const FORM_PRE_DEFAULTS: Partial<FormProps> = {
  schema: {},
  liveValidate: true,
  liveOmit: true,
  showErrorList: false,
};
const FORM_POST_DEFAULTS: Partial<FormProps> = { validator };

const SUBMIT_MD_OPTIONS: MarkdownToJSX.Options = {
  forceInline: true,
  forceBlock: false,
  forceWrapper: false,
};

const BTN_COMMON: Pick<ButtonProps, 'size' | 'className'> = {
  size: 'lg',
  className: 'col-12',
};

const SUBMIT_DEFAULT: Pick<ButtonProps, 'variant' | 'target'> = {
  variant: 'success',
  target: '_blank',
};

/** process a single form
 *
 * @param script - a DOM script with a urljsf mime type
 */
export async function makeOneForm(script: HTMLScriptElement): Promise<void> {
  const config = await getConfig(script);

  const container = document.createElement('div');
  script.parentNode!.insertBefore(container, script);

  const [fileFormProps, urlFormProps, _bootstrap] = await Promise.all([
    config.forms.file == null ? null : initFormProps(config.forms.file),
    initFormProps(config.forms.url),
    ensureBootstrap(config),
  ]);

  const [nunjucksEnv, initText] = await Promise.all([
    ensureNunjucks(),
    fileFormProps == null ? '' : getFileContent(config, fileFormProps.formData),
  ]);

  const props = { config, initText, fileFormProps, urlFormProps, nunjucksEnv };
  const form = <UrljsfForm {...props} />;
  const isolated = !!(config.iframe || config.iframe_style);
  if (isolated) {
    render(await renderIframe(config, form), container);
  } else {
    render(isolated ? await renderIframe(config, form) : form, container);
  }
}

/** a component for a form in a (themed) iframe */
async function renderIframe(config: Urljsf, form: JSX.Element): Promise<JSX.Element> {
  const { IFrame } = await import('./iframe.js');
  const cssUrl = await getBoostrapCss();
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
function UrljsfForm(props: IFormProps): JSX.Element {
  const { config, initText, fileFormProps, urlFormProps, nunjucksEnv } = props;
  const idPrefix = getIdPrefix(config);
  const initContext: IContext = {
    config,
    url: urlFormProps.formData,
    file: fileFormProps == null ? emptyObject : fileFormProps.formData,
    text: initText,
  };
  const initErrors: IErrors = { url: [], file: [] };
  const text = signal(initText);
  const context = signal(initContext);
  const errors = signal(initErrors);
  const defaultSubmit = urlFormProps.schema?.title || 'Submit';

  const url = computed(() =>
    renderUrl({
      template: config.templates.url,
      context: context.value,
      env: nunjucksEnv,
    }),
  );
  const submitText = computed(() =>
    renderMarkdown({
      template: config.templates.submit_button || defaultSubmit,
      context: context.value,
      env: nunjucksEnv,
    }),
  );

  const { checks } = config.templates;
  const checkCount = !checks ? 0 : Object.keys(checks).length;

  let checkResults: ReadonlySignal<Record<string, string>> | null = null;

  if (checks && checkCount) {
    checkResults = computed(() => {
      const errors: Record<string, string> = {};
      for (const [label, template] of Object.entries(checks)) {
        const rendered = renderMarkdown({
          template: template,
          context: context.value,
          env: nunjucksEnv,
        }).trim();

        if (rendered) {
          errors[label] = rendered;
        }
      }
      return errors;
    });
  }

  const errorCount = computed(
    () =>
      [
        ...errors.value.file,
        ...errors.value.url,
        ...(checkResults?.value ? Object.keys(checkResults.value) : []),
      ].length,
  );

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

  function makeFormProps(form: 'file' | 'url'): FormProps {
    const [onChange, initProps] =
      form == 'file'
        ? [onFileFormChange, fileFormProps]
        : [onUrlFormChange, urlFormProps];
    return {
      ...FORM_PRE_DEFAULTS,
      idPrefix: `${idPrefix}-${form}-`,
      id: `${idPrefix}-${form}`,
      ...((config.forms[form]?.props || emptyObject) as any),
      ...initProps,
      onChange,
      formData: context.value[form],
      ...FORM_POST_DEFAULTS,
    };
  }

  let style = !config.css_variables ? (
    <></>
  ) : (
    <Style forId={idPrefix} styles={config.css_variables}></Style>
  );

  const URLJSF = () => {
    let submitButton: JSX.Element;
    const checkItems: JSX.Element[] = [];

    const formProps = {
      file: makeFormProps('file'),
      url: makeFormProps('url'),
    };

    for (const form of ['file', 'url']) {
      if (form == 'file' && !fileFormProps) {
        continue;
      }
      const label =
        formProps[form as 'file' | 'url'].schema.title ||
        (form == 'url' ? 'URL' : 'File');
      checkItems.push(
        CheckItem({
          label,
          result: errors.value[form as 'file' | 'url'],
          key: `form-${form}`,
          markdown: true,
        }),
      );
    }

    if (checks && checkResults?.value) {
      for (const key of Object.keys(checks)) {
        const result = checkResults.value[key];
        checkItems.push(
          CheckItem({ label: key, result, markdown: true, key: `${!result}-${key}` }),
        );
      }
    }

    if (errorCount.value) {
      submitButton = (
        <Button onClick={onErrorClick} variant="danger" {...BTN_COMMON}>
          {errorCount} Error{errorCount.value > 1 ? 's' : ''}
        </Button>
      );
    } else {
      submitButton = (
        <Button as="a" href={url.value} {...SUBMIT_DEFAULT} {...BTN_COMMON}>
          <Markdown options={SUBMIT_MD_OPTIONS}>{submitText.value}</Markdown>
        </Button>
      );
    }

    return (
      <div className={FORM_CLASS} id={idPrefix}>
        {style}
        {config.forms.file && (
          <div>
            <RJSFForm {...formProps.file}>
              <Fragment />
            </RJSFForm>
            <hr />
          </div>
        )}
        <div>
          <RJSFForm {...formProps.url}>
            <Fragment />
          </RJSFForm>
        </div>
        <li className="list-group">
          {...checkItems}
          <li className=" list-group-item">{submitButton}</li>
        </li>
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
