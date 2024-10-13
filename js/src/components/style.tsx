// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { CssVariables, CssVariables1 } from '../_schema.js';
import { DEBUG } from '../tokens.js';

export function Style(props: IStyleProps): JSX.Element {
  const lines = makeRules(`#${props.forId}`, props.styles);
  return <style id={`${props.forId}-css-variables`}>{lines}</style>;
}

function makeRules(prefix: string, styles: CssVariables | CssVariables1): string {
  let lines = [`${prefix} {`];
  for (const [key, value] of Object.entries(styles)) {
    const trimmed = key.trim();
    if (trimmed.startsWith('--')) {
      lines.push(`${key}: ${value};`);
    } else if (typeof value == 'object') {
      lines.push(makeRules(key, value));
    }
  }
  lines.push('}');
  DEBUG && console.warn(lines);
  return lines.join('\n');
}

export interface IStyleProps {
  forId: string;
  styles: CssVariables;
}
