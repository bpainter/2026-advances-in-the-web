const content =
  document.querySelector('#content');

if ('navigation' in window) {
  navigation.addEventListener(
    'navigate', event => {
      if (!event.canIntercept ||
        event.hashChange ||
        event.downloadRequest !== null) {
        return;
      }
      const url =
        new URL(event.destination.url);
      if (url.origin !== location.origin) {
        return;
      }
      event.intercept({
        focusReset: 'manual',
        async handler() {
          const html = await fetchPartial(
            url, { signal: event.signal });
          content.replaceChildren(html);
          content.focus();
        }
      });
    });
}

async function fetchPartial(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(res.status);
  const page = new DOMParser()
    .parseFromString(await res.text(),
      'text/html');
  document.title = page.title;
  const frag = new DocumentFragment();
  frag.append(...page.querySelector(
    '#content').childNodes);
  return frag;
}
