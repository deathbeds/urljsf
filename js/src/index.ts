// Copyright (C) prjsf contributors.
// Distributed under the terms of the Modified BSD License.

const SELECTOR = '[data-prjsf-git-hub-repo]';

export async function main() {
  const containers = [...document.querySelectorAll(SELECTOR)];

  if (!containers.length) {
    return;
  }

  const { makeOneForm } = await import('./render.js');

  containers.forEach(makeOneForm);
}
void main();
