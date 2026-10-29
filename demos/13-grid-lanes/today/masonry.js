// A masonry wall like Masonry.js builds.
// Every item is absolutely positioned:
// script measures each one, puts it in the
// shortest column and sets the wall height.

const WIDTH = 104; // fixed item width, px
const GAP = 8;

export function layout(wall) {
  const items = [...wall.children];
  const columns = Math.max(
    1,
    Math.floor(
      (wall.clientWidth + GAP) /
        (WIDTH + GAP),
    ),
  );
  const heights = new Array(columns).fill(
    0,
  );
  for (const item of items) {
    // The shortest column takes the item.
    const column = heights.indexOf(
      Math.min(...heights),
    );
    const left = column * (WIDTH + GAP);
    item.style.left = `${left}px`;
    item.style.top = `${heights[column]}px`;
    heights[column] +=
      item.offsetHeight + GAP;
  }
  const tallest = Math.max(...heights);
  wall.style.height = `${tallest - GAP}px`;
  wall.dataset.laidOut = "";
}

// Heights are unknown until every photo
// has loaded.
export function photosLoaded(wall) {
  const images = [
    ...wall.querySelectorAll("img"),
  ];
  return Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth
        ? null
        : new Promise((done) => {
            img.onload = img.onerror = done;
          }),
    ),
  );
}

// Lay out again when the wall's width
// changes, once resizing pauses.
export function relayoutOnResize(wall) {
  let width = wall.clientWidth;
  let timer;
  new ResizeObserver(() => {
    if (wall.clientWidth === width) return;
    width = wall.clientWidth;
    clearTimeout(timer);
    timer = setTimeout(
      () => layout(wall),
      250,
    );
  }).observe(wall);
}
