// Copyright (C) prjsf contributors.
// Distributed under the terms of the Modified BSD License.

/** a form must declare, at an absolute minimum, its repo */
const SELECTOR = '[data-prjsf-git-hub-repo]';

export async function main() {
  const containers = [...document.querySelectorAll(SELECTOR)];

  if (containers.length) {
    const { makeOneForm } = await import('./render.js');
    containers.forEach(makeOneForm);
  }
}

void main();
