// D6 product-editor: shows the photo of the color the form holds (spec 4.6). It listens for the
// change event that both builds fire on their Color field, reads the posted value from the form
// and swaps the photo's src and alt. It never writes to a shown element.
(function () {
  var photo = document.querySelector(".wrap-editor__photo");
  if (!photo) return;
  var colors = (photo.dataset.wrapColors || "").split(" ");
  var name = photo.dataset.wrapName || "";
  function src(color) {
    return "/wrappers/trail-runner-2-" + color + ".webp";
  }
  // Decode the other colors ahead, so the swap never shows an empty frame.
  colors.forEach(function (c) {
    var img = new Image();
    img.src = src(c);
  });
  function show(color) {
    if (colors.indexOf(color) < 0 || photo.getAttribute("src") === src(color)) return;
    photo.src = src(color);
    photo.alt = name + " in " + color;
  }
  document.addEventListener("change", function (event) {
    var form = event.target && event.target.closest ? event.target.closest("form") : null;
    if (!form) return;
    show(String(new FormData(form).get("color") || ""));
  });
})();
