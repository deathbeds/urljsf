// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { Styles } from '../_schema.js';

export function Style(props: IStyleProps): JSX.Element {
  const lines = makeRules(`#${props.forId}`, props.styles).join('\n');
  return <style id={`${props.forId}-style`}>{lines}</style>;
}

function makeRules(prefix: string, styles: Styles | Record<string, any>): string[] {
  let lines = [`${prefix} {`];

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value == 'string') {
      lines.push(`${key.trim()}: ${value};`);
    } else if (typeof value == 'object') {
      lines.push(...makeRules(key, value));
    }
  }

  lines.push('}');
  return lines;
}

export interface IStyleProps {
  forId: string;
  styles: Styles;
}
