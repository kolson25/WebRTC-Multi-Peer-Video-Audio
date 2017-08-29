
var util                = require('util'),
    exec                = require('child_process').exec;

var gulp                = require('gulp'),
    plumber             = require('gulp-plumber'),
    uglify              = require('gulp-uglify'),
    babel               = require('gulp-babel'),
    jshint              = require('gulp-jshint'),
    concat              = require('gulp-concat'),
    debug               = require('gulp-debug'),
    strip               = require('gulp-strip-line'),
    gulpif              = require('gulp-if'),
    autoprefixer        = require('autoprefixer'),
    sourcemaps          = require('gulp-sourcemaps'),
    sass                = require('gulp-sass'),
    postcss             = require('gulp-postcss'),
    cssnano             = require('cssnano'),
    vueify              = require('vueify'),
    browserify          = require('browserify'),
    fs                  = require('fs'),
    chalk               = require('chalk'),
    babelify            = require('babelify'),
    source              = require('vinyl-source-stream'),
    streamify           = require('gulp-streamify')

var files = {

    frontendbrowserifiedjs: {
        sourcePath: 'build/javascripts/',
        entryPointName: 'index.js',
        dest: './',
        bundleName: 'main.js'
    },
};

gulp.task('frontend-browserified-js', () => {
    var stream = browserify(`${files.frontendbrowserifiedjs.sourcePath}/${files.frontendbrowserifiedjs.entryPointName}`)
        .transform(vueify)
        .transform('babelify', {presets: ['es2015']})
        .bundle()
        .on('error', handleError)
        .pipe(source(files.frontendbrowserifiedjs.bundleName))

    stream.pipe(gulp.dest(files.frontendbrowserifiedjs.dest))

    function handleError(error) {
        console.error(error.stack)
        console.log(chalk.red('hit error while gulping.'))
    }
})

gulp.task('watch', function() {
    gulp.watch(`${files.frontendbrowserifiedjs.sourcePath}/**/*.{js,vue}`, ['frontend-browserified-js'])
});

gulp.task('build',   ['frontend-browserified-js']);

gulp.task('default', ['build']);
