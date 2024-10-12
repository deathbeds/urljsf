import { BOOTSTRAP_ID } from './tokens.js';

let _loading: Promise<string> | null = null;
let _bootstrapCss: string;

const BOOTSTRAP_LINK_SELECTOR = `
  link[href *= "bootstrap.min.css"],
  link#${BOOTSTRAP_ID}
`;

export async function getBoostrapCss(): Promise<string> {
  if (!_loading) {
    _loading = new Promise(async (resolve) => {
      _bootstrapCss = (await import('bootstrap/dist/css/bootstrap.min.css')).default;
      resolve(_bootstrapCss);
    });
  }
  return _bootstrapCss || (await _loading);
}

export async function ensureBootstrap(document?: Document): Promise<void> {
  document = document || window.document;

  if (_loading) {
    await _loading;
  }

  if (findBootstrap()) {
    return;
  }

  let bsLink = document.createElement('link');
  bsLink.id = BOOTSTRAP_ID;
  document.head.appendChild(bsLink);
  bsLink.rel = 'stylesheet';
  bsLink.href = await getBoostrapCss();
}

export function findBootstrap(): HTMLLinkElement | null {
  return document.querySelector(BOOTSTRAP_LINK_SELECTOR);
}
