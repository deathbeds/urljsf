// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.

export const MIME_FRAGMENT = 'application/vnd.deathbeds.urljsf.v0+';
export const SELECTOR = `script[type^="${MIME_FRAGMENT}"]`;

export async function main() {
  const urljsfScripts = [...document.querySelectorAll(SELECTOR)] as HTMLScriptElement[];

  /* istanbul ignore else */
  if (urljsfScripts.length) {
    const { makeOneForm } = await import('./components/form.js');
    urljsfScripts.forEach(makeOneForm);
  }
}

void main();
