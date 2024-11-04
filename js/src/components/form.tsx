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
  DEBUG,
  DEFAULTS,
  FORM_CLASS,
  IContext,
  IErrors,
  IFormsProps,
  IUrljsfFormProps,
  emptyObject,
} from '../tokens.js';
import { getConfig, getIdPrefix, initFormProps } from '../utils.js';
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

const DEFAULT_SUBMIT = 'Submit';

/** process a single form
 *
 * @param script - a DOM script with a urljsf mime type
 */
export async function makeOneForm(script: HTMLScriptElement): Promise<void> {
  const config = await getConfig(script);

  const container = document.createElement('div');
  script.parentNode!.insertBefore(container, script);

  const [_bootstrap, nunjucksEnv] = await Promise.all([
    ensureBootstrap(config),
    ensureNunjucks(config),
  ]);

  const forms: IFormsProps = {};

  await Promise.all(
    Object.entries(config.forms).map(async ([key, form]) => {
      const props = await initFormProps(form);
      forms[key] = props;
    }),
  );

  const props: IUrljsfFormProps = { config, forms, nunjucksEnv };
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

function getFormData([key, form]: [string, form: Partial<FormProps | null>]): [
  string,
  null | Record<string, any>,
] {
  return [key, form?.formData];
}

/** a component for a file and URL form */
function UrljsfForm(props: IUrljsfFormProps): JSX.Element {
  const { config, forms, nunjucksEnv } = props;
  const idPrefix = getIdPrefix(config);
  const initFormData = Object.fromEntries(Object.entries(forms).map(getFormData));
  const initContext: IContext = {
    config,
    data: initFormData,
  };
  const initErrors: IErrors = { url: [], file: [] };
  const context = signal(initContext);
  const errors = signal(initErrors);

  const url = computed(() =>
    renderUrl({
      template: config.templates.url,
      context: context.value,
      env: nunjucksEnv,
    }),
  );

  const submitText = computed(() =>
    renderMarkdown({
      template: config.templates.submit_button || DEFAULT_SUBMIT,
      context: context.value,
      env: nunjucksEnv,
    }),
  );

  const makeOnFormChange = async (key: string, evt: IChangeEvent) => {
    batch(() => {
      context.value = {
        ...context.value,
        data: { ...context.value.data, [key]: evt.formData },
      };
      errors.value = { ...errors.value, [key]: evt.errors };
    });
  };

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

  function makeFormProps(key: string, initProps: Partial<FormProps>): FormProps {
    return {
      ...FORM_PRE_DEFAULTS,
      idPrefix: `${idPrefix}-${key}-`,
      id: `${idPrefix}-${key}`,
      ...((config.forms[key]?.props || emptyObject) as any),
      ...initProps,
      onChange: makeOnFormChange.bind(null, key),
      formData: context.value.data[key],
      ...FORM_POST_DEFAULTS,
    };
  }

  let style = !config.style ? (
    <></>
  ) : (
    <Style forId={idPrefix} styles={config.style}></Style>
  );

  const orderedKeys = Object.keys(forms);
  orderedKeys.sort((a: string, b: string): number => {
    return (
      (config.forms[a].rank || 0) - (config.forms[b].rank || 0) || a.localeCompare(b)
    );
  });

  const URLJSF = () => {
    const START = performance.now();
    let submitButton: JSX.Element;
    const checkItems: JSX.Element[] = [];
    const formItems: JSX.Element[] = [];

    for (const key of orderedKeys) {
      const form = forms[key];
      if (!form) {
        continue;
      }
      const props = makeFormProps(key, form);
      const label = props.schema.title || key;
      checkItems.push(
        CheckItem({
          label,
          result: errors.value[key],
          key: `check-${key}`,
          markdown: true,
        }),
      );
      formItems.push(
        <li className="list-group-item" key={key}>
          <RJSFForm {...props}>
            <Fragment />
          </RJSFForm>
        </li>,
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

    DEBUG && console.warn(performance.now() - START);

    return (
      <div className={FORM_CLASS} id={idPrefix}>
        {style}
        <ul className="list-group">
          {...formItems}
          {...checkItems}
          <li className="list-group-item">{submitButton}</li>
        </ul>
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
