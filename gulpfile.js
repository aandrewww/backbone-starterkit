var config = require('./config.json');
var gulp = require('gulp');
var browserify = require('gulp-browserify');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var hbsfy = require('hbsfy');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var del = require('del');
var runSequence = require('run-sequence');
var less = require('gulp-less');
var rev = require('gulp-rev');
var merge = require('merge-stream');

gulp.task('clean', function() {
    return del.sync([config.dist]);
});

gulp.task('browserify', function() {
    return gulp.src(config.src + 'js/app/main.js')
        .pipe(browserify({transform: 'hbsfy'}))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(config.dist + 'js'));
});

gulp.task('less', function() {
    return gulp.src(config.src + 'styles/less/**/*.less')
      .pipe(less())
      .pipe(gulp.dest(config.dist + 'css'));
});

gulp.task('usemin', function() {
    return gulp.src(config.dist + '*.html')
        .pipe(usemin({
            css: [ minifyCss, 'concat', rev ],
            js: [uglify, rev]
        }))
        .pipe(gulp.dest(config.dist));
});

gulp.task('copy', function() {

    var indexHtml = gulp.src(config.src + 'html/index.html')
        .pipe(gulp.dest('dist'));

    var libs = gulp.src(config.paths.libs, {base: './node_modules'})
        .pipe(gulp.dest(config.dist + config.javascript));

    var otherAssets = gulp.src([
            config.src + config.images + '/**',
            config.src + config.fonts + '/**'
        ], {base: config.src})
        .pipe(gulp.dest(config.dist));

    return merge(indexHtml, libs, otherAssets);
});

gulp.task('watch', function() {
    browserSync({
        server: {
            baseDir: config.dist
        }
    });
    gulp.watch(config.src + 'js/**/*.*', ['browserify', browserSync.reload]);
    gulp.watch(config.src + 'styles/**/*.*', ['less', browserSync.reload]);
    gulp.watch(config.src + 'html/**/*.*', ['copy', browserSync.reload]);
});


gulp.task('default', function(cb) {
    runSequence(
        'clean',
        'browserify',
        'less',
        'copy',
        'watch',
        cb
    );
});


gulp.task('build', function(cb) {
    runSequence(
        'clean',
        'browserify',
        'less',
        'copy',
        'usemin',
        cb
    );
});
