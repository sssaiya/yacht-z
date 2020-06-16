const makeDir = require("make-dir");
var compressor = require("node-minify");
const fs = require("fs");
var uglifycss = require("uglifycss");

makeDir("dist/");
makeDir("dist/styles");
fs.readdir("./public/js", function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }
  files.forEach(async function (file, index) {
    console.log(file);
    // With Promise
    var minfyJS = compressor.minify({
      compressor: "uglify-es",
      input: "./public/js/" + file,
      output: "dist/js/" + file,
    });

    await minfyJS
      .then(function (min) {})
      .catch((e) => {
        console.log(e);
      });
  });
});

fs.readdir("./public/styles", function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }
  files.forEach(async function (file, index) {
    var uglified = uglifycss.processFiles(["./public/styles/" + file], {
      maxLineLen: 500,
      expandVars: true,
    });

    fs.writeFile("dist/styles/" + file, uglified, (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;
    });
  });
});

// destination.txt will be created or overwritten by default.
fs.copyFile(
  "public/manifest.webmanifest",
  "dist/manifest.webmanifest",
  (err) => {
    if (err) throw err;
  }
);

fs.copyFile(
  "public/service-worker.js",
  "dist/service-worker.js",
  (err) => {
    if (err) throw err;
  }
);

fs.copyFile(
  "public/sw.js",
  "dist/sw.js",
  (err) => {
    if (err) throw err;
  }
);

var compress_images = require("compress-images"),
  INPUT_path_to_your_images,
  OUTPUT_path;
INPUT_path_to_your_images =
  "public/images/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}";
OUTPUT_path = "dist/images/";

compress_images(
  INPUT_path_to_your_images,
  OUTPUT_path,
  { compress_force: false, statistic: true, autoupdate: true },
  false,
  { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
  { png: { engine: "pngquant", command: ["--quality=20-50"] } },
  { svg: { engine: "svgo", command: "--multipass" } },
  { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
  function (error, completed, statistic) {
    console.log("-------------");
    console.log(error);
    console.log(completed);
    console.log(statistic);
    console.log("-------------");
  }
);
