// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { useState } from 'react';

const PRE_STYLE = { position: 'relative' };

type TPreProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLPreElement>,
  HTMLPreElement
>;

const COPY_STYLE = {
  position: 'absolute',
  top: '0.25em',
  right: '0.25em',
  opacity: 0.8,
};

const NOT_YET = 0;
const COPIED = 1;
const ERRORED = 2;

const STATE_ICON = ['primary', 'success', 'warning'];
const STATE_LABEL = ['copy', 'ok', 'error'];

export function CopyPastePre(props: TPreProps): JSX.Element {
  const button: JSX.Element[] = [];

  const text = `${(props.children as any)?.props?.children || ''}`.trim();

  if (text) {
    const [copyState, setCopyState] = useState(NOT_YET);
    const btnClass = `urljsf-copybutton btn btn-${STATE_ICON[copyState]}`;
    const btnLabel = STATE_LABEL[copyState];

    const onClick = () => {
      setCopyState(copyText(text) ? COPIED : ERRORED);
      setTimeout(() => setCopyState(NOT_YET), 1000);
    };

    button.push(
      <button
        className={btnClass}
        style={COPY_STYLE}
        onClick={onClick}
        aria-label="copy this text"
      >
        {btnLabel}
      </button>,
    );
  }

  return (
    <pre {...props} style={PRE_STYLE}>
      {...button}
      {props.children}
    </pre>
  );
}

function copyText(text: string): boolean {
  const el = document.createElement('textarea');
  let result = false;
  try {
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    result = true;
  } catch (err) {
    /* istanbul ignore next */
    console.error('failed to copy', err);
  } finally {
    el.remove();
  }
  return result;
}
