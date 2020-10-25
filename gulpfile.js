"use strict";

// Load plugins
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const cssnano = require("cssnano");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const csscomb = require('gulp-csscomb');
const minify = require('gulp-minify');
const buffer = require('vinyl-buffer');
const spritesmith = require('gulp.spritesmith');
const spritesmash = require('gulp-spritesmash');


// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "dist"
        },
        port: 3000
    });
    done();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Optimize Images
function images() {
    return gulp
        .src("app/images/**/*")
        .pipe(newer("dist/images/"))
        .pipe(
            imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {
                            removeViewBox: false,
                            collapseGroups: true
                        }
                    ]
                })
            ])
        )
        .pipe(gulp.dest("dist/images/"));
}

// Spritsmith task

function sprite() {
    return gulp.src("app/images/icons/*")
        .pipe(spritesmith({
            imgName: 'images/sprite.png',
            cssName: 'css/sprite.css'
        }))
        .pipe(buffer())
        //.pipe(spritesmash())
        .pipe(gulp.dest('dist/css/sprite/'));
}

// CSS task
function css() {
    return gulp
        .src("app/scss/styles.scss")
        .pipe(plumber())
        .pipe(sass({outputStyle: "expanded"}))
        .pipe(csscomb('.csscomb.json'))
        .pipe(gulp.dest("dist/css/"))
        .pipe(rename({suffix: ".min"}))
        .pipe(postcss([autoprefixer({
            browserlist: [
                'Android 2.3',
                'Android >= 4',
                'Chrome >= 20',
                'Firefox >= 24',
                'Explorer >= 8',
                'iOS >= 6',
                'Opera >= 12',
                'Safari >= 6']
        }), cssnano()]))
        .pipe(gulp.dest("dist/css/"))
        .pipe(browsersync.stream())
}

// Transpile, concatenate and minify scripts
function scripts() {
    return (
        gulp
            .src(["app/js/*.js"])
            .pipe(plumber())
            .pipe(minify())
            .pipe(gulp.dest("dist/js/"))
            .pipe(browsersync.stream())
    );
}

// Watch files
function watchFiles() {
    gulp.watch("app/scss/**/*", css);
    gulp.watch("app/js/**/*.js", scripts);
    gulp.watch("app/images/**/*", images);
    gulp.watch("app/images/icons/*", sprite);
    gulp.watch(
        [
            "dist/index.html",
            "dist/css/**/*",
            "dist/js/**/*",
            "dist/images/**",
            "dist/photos.html",

        ], browserSyncReload
    );
}

const js = gulp.series(scripts);
const watch = gulp.parallel(watchFiles, browserSync);

exports.images = images;
exports.css = css;
exports.js = js;
exports.watch = watch;
exports.sprite = sprite;




