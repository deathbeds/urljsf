// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.

export const MIME_FRAGMENT = 'application/vnd.deathbeds.prjsf.v0+';
export const SELECTOR = `script[type^="${MIME_FRAGMENT}"]`;

export async function main() {
  const urjsfScripts = [...document.querySelectorAll(SELECTOR)] as HTMLScriptElement[];

  /* istanbul ignore else */
  if (urjsfScripts.length) {
    const { makeOneForm } = await import('./components/form.js');
    urjsfScripts.forEach(makeOneForm);
  }
}

void main();
