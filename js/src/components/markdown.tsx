// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type { MarkdownToJSX } from 'markdown-to-jsx';

import { CopyPastePre } from './copy-paste-pre.js';

export const MD_OPTIONS: MarkdownToJSX.Options = {
  overrides: { pre: CopyPastePre },
};
