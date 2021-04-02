const gulp = require("gulp");
const browserSync = require("browser-sync");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");

const copyFiles = () => {
  return (
    gulp.src([
      "app/*.html",
      "app/**/*.jpg",
    ])
    .pipe(gulp.dest("build"))
  );
}
gulp.task("copy", copyFiles);


const processJS = () => {
  return gulp.src("app/scripts/*.js")
    .pipe(babel({ presets: ["env"] }))
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("build/scripts/"));
}
gulp.task("processJS", processJS);

const watch = () => {
  gulp.watch("app/scripts/*.js", gulp.series(processJS)),
  gulp.watch("app/scripts/*.css", gulp.series(processCSS))
}
gulp.task("watch", watch);

const processCSS = () => {
  return gulp.src("app/styles/*.css")
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("build/styles/"));
}
gulp.task("processCSS", processCSS);

const serveFiles = () => {
  return browserSync.init({
    server: "build",
    open: false,
    port: 3000
  });
}
gulp.task(
  "buildAndServe",
  gulp.series(
    copyFiles, processCSS, processJS,
    gulp.parallel(serveFiles, watch)
  )
);
