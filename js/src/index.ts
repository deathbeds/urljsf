// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.

export const MIME_FRAGMENT = 'application/vnd.deathbeds.prjsf.v0+';
export const SELECTOR = `script[type^="${MIME_FRAGMENT}"]`;

export async function main() {
  const containers = [...document.querySelectorAll(SELECTOR)] as HTMLScriptElement[];

  if (containers.length) {
    const { makeOneForm } = await import('./render.js');
    containers.forEach(makeOneForm);
  }
}

void main();
