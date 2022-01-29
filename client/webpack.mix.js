let mix = require('laravel-mix');

mix
  .ts("src/app.ts", "dist")
  .copy("index.html", "dist")
  .sass("src/css/main.scss", "dist/css")
  .copy("assets", "dist/assets");
