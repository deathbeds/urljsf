// Copyright (C) prjsf contributors.
// Distributed under the terms of the Modified BSD License.

import type { FormProps } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { Fragment, render } from 'react-dom';
import { useState } from 'react';
import Form from '@rjsf/bootstrap-4';
import { Form as BS, Badge } from 'react-bootstrap';

import { DEFAULTS, type TDataSet } from './tokens.js';

import { fetchData, getFileContent, getDataSet } from './utils.js';

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
    const branches = `${dataset.prjsfGitHubBranch || DEFAULTS.prjsfGitHubBranch}`
      .trim()
      .split(' ');
    const [value, setValue] = useState('');
    const [url, setUrl] = useState('#');
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

    const updateFormData = async (formData: any) => {
      let value = await getFileContent(dataset, formData);
      setValue(value);
      setFormData(formData);
      updateUrl();
    };

    const idPrefix = dataset.prjsfIdPrefix || void 0;

    if (!value) {
      void updateFormData(formData);
    }

    const formProps: FormProps = {
      schema: {},
      validator,
      liveValidate: true,
      idPrefix,
      onChange: async ({ formData }) => await updateFormData(formData),
      ...props,
    };

    let branchEl: JSX.Element;
    if (branches.length == 1) {
      branchEl = <code>{branch}</code>;
    } else {
      branchEl = (
        <BS.Group>
          <BS.Control
            as="select"
            custom
            onChange={(e) => setBranch(e.currentTarget.value)}
          >
            {branches.map(makeOneBranchOption)}
          </BS.Control>
        </BS.Group>
      );
    }

    const badge = (
      <Badge pill className="bg-secondary badge-secondary">
        <i className="fab fa-github"></i> {dataset.prjsfGitHubRepo}
      </Badge>
    );

    const button = (
      <a href={url} class="form-control btn btn-primary" role="button" target="_blank">
        Start <i class="fa fa-code-pull-request"></i> Pull Request with{' '}
        <code>{fileName}</code>
      </a>
    );

    return (
      <div class="card prjsf">
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <Form {...formProps} formData={formData}>
              <Fragment />
            </Form>
          </li>
          <li class="list-group-item">
            <label class="form-label">Preview</label>
            <textarea
              className="form-control font-monospace"
              value={value}
              spellcheck={false}
              rows={10}
            ></textarea>
          </li>
          <li class="list-group-item">
            <label class="form-label">
              {dataset.prjsfDataFormat?.toUpperCase()} file name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder={fileName}
              onChange={(change) => {
                setFileName(change.currentTarget.value);
                updateUrl();
              }}
            />
          </li>
          <li class="list-group-item">
            {badge} {branchEl} {button}
          </li>
        </ul>
      </div>
    );
  };

  return <PRJSF />;
}
