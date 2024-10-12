import { Urljsf } from './_schema.js';
import { BOOTSTRAP_ID } from './tokens.js';

let _loading: Promise<string> | null = null;
let _addingLink: Promise<void> | null = null;
let _bootstrapCss: string;

const BOOTSTRAP_LINK_SELECTOR = `
  link[href*="bootstrap.min.css"],
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

export async function ensureBootstrap(
  config: Urljsf,
  document?: Document,
): Promise<void> {
  if (config.no_bootstrap || config.iframe || config.iframe_style) {
    return;
  }

  document = document || window.document;

  if (findBootstrap(document)) {
    return;
  }

  if (!_addingLink) {
    _addingLink = new Promise(async (resolve) => {
      let bsLink = document.createElement('link');
      bsLink.id = BOOTSTRAP_ID;
      document.head.appendChild(bsLink);
      bsLink.rel = 'stylesheet';
      bsLink.href = await getBoostrapCss();
      resolve(void 0);
    });
  }
  return await _addingLink;
}

export function findBootstrap(document: Document): HTMLLinkElement | null {
  return document.querySelector(BOOTSTRAP_LINK_SELECTOR);
}
