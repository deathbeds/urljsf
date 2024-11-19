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
import { ensureNunjucks, renderMarkdown } from '../nunjucks.js';
import {
  CHECKS_PATH_PREFIX,
  DEBUG,
  DEFAULTS,
  FORM_CLASS,
  IAboveBelowForms,
  IContext,
  IErrors,
  IFormAboveBelow,
  IFormsProps,
  IUrljsfFormProps,
  emptyObject,
} from '../tokens.js';
import { getConfig, getIdPrefix, initFormProps } from '../utils.js';
import { CheckItem } from './check-item.js';
import { MD_OPTIONS } from './markdown.js';
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
  ...MD_OPTIONS,
};

const BTN_COMMON: Pick<ButtonProps, 'size' | 'className'> = {
  size: 'lg',
  className: 'col-12 urljsf-submit',
};

const SUBMIT_DEFAULT: Pick<ButtonProps, 'variant' | 'target'> = {
  variant: 'success',
};

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
  render(isolated ? await renderIframe(config, form) : form, container);
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

  // build all signals
  const context = signal(initContext);
  const errors = signal(initErrors);

  const url = computed(() => {
    let _url = '#';
    try {
      _url = nunjucksEnv.render('url', context.value).replace(/\s\n/, '');
    } catch (err) {
      /* istanbul ignore next */
      DEBUG && console.warn('Could not render URL', err);
    }
    return _url;
  });

  const downloadFilename = computed(() => {
    let name = '';
    try {
      name = nunjucksEnv.render('download_filename', context.value).trim();
    } catch (err) {
      /* istanbul ignore next */
      DEBUG && console.warn('Could not render download filename', err);
    }
    return name;
  });

  const linkTarget = computed(() => {
    let name = '';
    try {
      name = nunjucksEnv.render('submit_target', context.value).trim();
    } catch (err) {
      /* istanbul ignore next */
      DEBUG && console.warn('Could not render link target', err);
    }
    return name;
  });

  const submitText = computed(() =>
    renderMarkdown({
      path: 'submit_button',
      context: context.value,
      env: nunjucksEnv,
    }),
  );

  const aboveBelow: IAboveBelowForms = {};

  const makeAboveBelow = (path: string): ReadonlySignal<string> => {
    return computed(() =>
      renderMarkdown({ path, context: context.value, env: nunjucksEnv }),
    );
  };

  for (const key of Object.keys(forms)) {
    const formAb: IFormAboveBelow = {};
    let hasAb = false;
    for (const ab of ['above', 'below'] as (keyof IFormAboveBelow)[]) {
      const abName = `${ab}_${key}`;
      const tmpl = (config.templates && config.templates[abName]) || null;
      if (tmpl) {
        formAb[ab] = makeAboveBelow(abName);
        hasAb = true;
      }
    }
    if (hasAb) {
      aboveBelow[key] = formAb;
    }
  }

  const makeOnFormChange = (key: string, evt: IChangeEvent) => {
    batch(() => {
      context.value = {
        ...context.value,
        data: { ...context.value.data, [key]: evt.formData },
      };
      errors.value = { ...errors.value, [key]: evt.errors };
    });
  };

  const { checks } = config;
  const checkCount = !checks ? 0 : Object.keys(checks).length;

  let checkResults: ReadonlySignal<Record<string, string>> | null = null;

  if (checks && checkCount) {
    checkResults = computed(() => {
      const errs: Record<string, string> = {};
      for (const label of Object.keys(checks)) {
        let rendered = 'X';
        try {
          rendered = renderMarkdown({
            path: `${CHECKS_PATH_PREFIX}/${label}`,
            context: context.value,
            env: nunjucksEnv,
          }).trim();
        } catch (err) {
          /* istanbul ignore next */
          DEBUG && console.warn('Failed to check', label, err);
        }

        if (rendered) {
          errs[label] = rendered;
        }
      }
      return errs;
    });
  }

  const errorCount = computed(() => {
    let allErrors: any[] = checkResults?.value ? Object.keys(checkResults.value) : [];
    for (const formErrs of Object.values(errors.value)) {
      allErrors.push(...formErrs);
    }
    return allErrors.length;
  });

  function makeFormProps(key: string, initProps: Partial<FormProps>): FormProps {
    return {
      ...FORM_PRE_DEFAULTS,
      idPrefix: `${idPrefix}-${key}`,
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
      (config.forms[a].order || 0) - (config.forms[b].order || 0) || a.localeCompare(b)
    );
  });

  const makeAboveBelowElements = (
    key: string,
    where: keyof IFormAboveBelow,
  ): JSX.Element[] => {
    const tmpl = aboveBelow[key] && aboveBelow[key][where];
    return tmpl == null
      ? []
      : [
          <li className="list-group-item" key={`${key}-where`}>
            <Markdown options={MD_OPTIONS}>{tmpl.value}</Markdown>
          </li>,
        ];
  };

  const URLJSF = () => {
    let submitButton: JSX.Element[] = [];
    const checkItems: JSX.Element[] = [];
    const formItems: JSX.Element[] = [];

    for (const key of orderedKeys) {
      const form = forms[key];
      /* istanbul ignore next */
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
      formItems.push(...makeAboveBelowElements(key, 'above'));
      formItems.push(
        <li className="list-group-item" key={key}>
          <RJSFForm {...props}>
            <Fragment />
          </RJSFForm>
        </li>,
      );
      formItems.push(...makeAboveBelowElements(key, 'below'));
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
      submitButton = [
        <li className="list-group-item">
          <Button onClick={onErrorClick} variant="danger" {...BTN_COMMON}>
            {errorCount} Error{errorCount.value > 1 ? 's' : ''}
          </Button>
        </li>,
      ];
    } else if (submitText.value) {
      const download = downloadFilename.value
        ? { download: downloadFilename.value }
        : emptyObject;
      const target = linkTarget.value ? { target: linkTarget.value } : emptyObject;
      submitButton = [
        <li className="list-group-item">
          <Button
            as="a"
            href={url.value}
            {...SUBMIT_DEFAULT}
            {...BTN_COMMON}
            {...download}
            {...target}
          >
            <Markdown options={SUBMIT_MD_OPTIONS}>{submitText.value}</Markdown>
          </Button>
        </li>,
      ];
    }

    return (
      <div className={FORM_CLASS} id={idPrefix}>
        {style}
        <ul className="list-group">
          {...formItems}
          {...checkItems}
          {...submitButton}
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
