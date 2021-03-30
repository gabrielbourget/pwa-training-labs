const gulp = require("gulp");
const browserSync = require("browser-sync");
const babel = require("gulp-babel");

const copyFiles = () => {
  return (
    gulp.src([
      "app/*.html",
      "app/**/*.jpg",
      "app/**/*.css",
    ])
    .pipe(gulp.dest("build"))
  );
}
gulp.task("copy", copyFiles);


const processJS = () => {
  return gulp.src("app/scripts/*.js")
    .pipe(babel({ presets: ["env"] }))
    .pipe(gulp.dest("build/scripts"));
}
gulp.task("processJS", processJS);


const serveFiles = () => {
  return browserSync.init({
    server: "build",
    open: false,
    port: 3000
  });
}
gulp.task("buildAndServe", gulp.series(copyFiles, processJS, serveFiles));
