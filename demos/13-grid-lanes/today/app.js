// The wall waits for its photos and lays
// them out. It lays out again after a
// resize or Show more.
import {
  layout,
  photosLoaded,
  relayoutOnResize,
} from "./masonry.js";

const wall =
  document.querySelector("#t-wall");
const more =
  document.querySelector("#t-more");

await photosLoaded(wall);
layout(wall);
relayoutOnResize(wall);

more.addEventListener("click", async () => {
  const from = wall.children.length;
  const res = await fetch(
    `photos?from=${from}`,
  );
  wall.insertAdjacentHTML(
    "beforeend",
    await res.text(),
  );
  await photosLoaded(wall);
  layout(wall);
});
