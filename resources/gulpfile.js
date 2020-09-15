/**
 * Gulp Main Config Setup.
 * Reference: https://github.com/gulpjs/gulp#sample-gulpfilejs
 * Github: https://github.com/gulpjs/gulp
 * 
 * @author Joshua Clifford Reyes<joshua.reyes@gmanmi.com>
 */
var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var autoPrefixer = require('gulp-autoprefixer');

var paths = {
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'dist/styles/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'dist/scripts/'
    }
};

gulp.task('styles', function () {
    return gulp.src(paths.styles.src)
        .pipe(sass())
        .pipe(cleanCSS({level: {1: {specialComments: 0}}}))
        .pipe(autoPrefixer())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('scripts', function () {
    return gulp.src(paths.scripts.src)
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('clean', function () {
    return del(['dist']);
});

gulp.task('watch', function () {
    gulp.watch(paths.styles.src, gulp.series('styles'));
    gulp.watch(paths.scripts.src, gulp.series('scripts'));
});

gulp.task('build', gulp.series('clean', 'styles', 'scripts'));
