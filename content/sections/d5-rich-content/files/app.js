import DOMPurify from
  '/vendor/purify.es.mjs';

const description =
  document.querySelector('#description');
const clean = value =>
  DOMPurify.sanitize(value);

const cmsPolicy =
  window.trustedTypes?.createPolicy(
    'cms-html', { createHTML: clean }
  ) ?? { createHTML: clean };

export function render(body) {
  const trusted =
    cmsPolicy.createHTML(body);
  description.innerHTML = trusted;
}

// This now throws under enforcement:
export function renderDirect(body) {
  description.innerHTML = body;
}

const cmsResponse = await fetch(
  '/cms/ridgeline.json')
  .then(r => r.json());
render(cmsResponse.body);
