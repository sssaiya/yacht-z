const { PurgeCSS } = require("purgecss");
const fs = require("fs");
const jsdiff = require("diff");

async function purge() {
  return await new PurgeCSS()
    .purge({
      content: ["public/*.js", "public/*.html"],
      css: ["public/*.css"],
    })
    .catch((e) => {
      console.log(e);
    });
}
Promise.resolve(purge()).then(function (value) {
  var removed = false;
  value.forEach(function (purged) {
    const fileName = purged.file.toString();
    const purgedCss = purged.css.toString();
    // console.log(fileName);
    fs.readFile(fileName, "utf8", function (err, data) {
      if (err) {
        throw err;
      }
      const originalCss = data.toString();

      var diff = jsdiff.diffCss(originalCss, purgedCss);
      diff.forEach(function (part) {
        const toRemove = part.removed ? true : false;
        var color = part.added
          ? "\x1b[47m"
          : part.removed
          ? "\x1b[41m"
          : "\x1b[42m";

        if (toRemove) {
          console.error(color + "%s\x1b[0m", part.value);
          removed = true;
        }
      });
      if (!removed) {
        console.log("\x1b[42m%s\x1b[0m", "✓ No Unused CSS in " + fileName);
        removed = false;
      }
    });
  });
});
