// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type { JSX } from 'react';

import type { RJSFValidationError } from '@rjsf/utils';

import Markdown from 'markdown-to-jsx';

import { MD_OPTIONS } from './markdown.js';

export function CheckItem(props: CheckItemProps): JSX.Element {
  let result: string;
  if (Array.isArray(props.result)) {
    const lines: string[] = [];
    for (const err of props.result) {
      lines.push(`- [ ] ${err.message}`);
    }
    result = lines.join('\n');
  } else {
    result = props.result;
  }
  return (
    <li className="list-group-item" key={props.key}>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={!result}
          disabled
        ></input>
        <label className="form-check-label">
          <em>
            {props.markdown ? (
              <Markdown options={MD_OPTIONS}>{props.label}</Markdown>
            ) : (
              props.label
            )}
          </em>
        </label>
      </div>
      {!result ? (
        <></>
      ) : props.markdown ? (
        <div>
          <Markdown options={MD_OPTIONS}>{result}</Markdown>
        </div>
      ) : (
        result
      )}
    </li>
  );
}

export interface CheckItemProps {
  label: string;
  result: string | RJSFValidationError[];
  markdown?: boolean;
  key: string;
}
