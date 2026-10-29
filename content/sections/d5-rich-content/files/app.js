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

export function render(body,
  slot = description) {
  const trusted =
    cmsPolicy.createHTML(body);
  slot.innerHTML = trusted;
}

// This now throws under enforcement:
export function renderDirect(body) {
  description.innerHTML = body;
}

const cms = await fetch(
  '/cms/ridgeline.json')
  .then(r => r.json());
render(cms.body);
render(cms.reviews,
  document.querySelector('#reviews'));
render(cms.promo,
  document.querySelector('#promo'));
