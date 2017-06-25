'use strict';

// 1. Plugins for development   sudo npm install - load modules
var gulp = require('gulp'), // base
    watch = require('gulp-watch'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    gulpIf= require('gulp-if'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    plumber = require('gulp-plumber'),
    path = require('path'),
    newer = require('gulp-newer'),
    less = require('gulp-less'),
    prefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    uglify = require('gulp-uglify'), // js
    imagemin = require('gulp-imagemin'), // img
    isDev = (process.env.NODE_ENV !== 'prod') ? true : false,  // type of a build
    del = require('del'),
    
// 2. Configure paths
    paths = {
        input: { // input 
            html: './**/*.html',
            style: ['./style/**/*.less',
                './vendors/**/*.less'],
            js: ['./js/**/*.js', '!/**/*.comp.js'],
            fonts: './fonts/**/*',
            images : ['./img/**/*.*', './images/**/*.*'],
            vendors : './vendors/**/*'
        },
        build: { // output
            html: '../html/',
            style: '../html/style/',
            js: '../html/js/',
            fonts: '../html/fonts/',
            images: '../html/',
            vendors: '../html/vendors/'
        }
    },


// 3. Task names
    tasks = { // tasks names
        html: 'html:build',
        style: 'style:build',
        js: 'js:build',
        fonts: 'fonts:build',
        images: 'images:build',
        vendors: 'vendors:build'
    };

gulp.task('html:build', function () { // html conversion
    return gulp.src(paths.input.html)
        .pipe(plumber({
            errorHandler : notify.onError(function (err) {
                return {
                    title: 'HTML',
                    message: err.message
                }
            })
        }))
        .pipe(rigger())
        .pipe(gulp.dest(paths.build.html) )
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () { // style conversion
    return gulp.src(paths.input.style )
        .pipe(plumber({
            errorHandler : notify.onError(function (err) {
                return {
                    title: 'STYLE',
                    message: err.message,
                    sound: 'Beep'
                }
            })
        }))
        .pipe(gulpIf( isDev, sourcemaps.init()) )
        .pipe(less())
        .pipe(prefixer())
        .pipe(gulpIf( isDev, sourcemaps.write()) )
        .pipe(gulpIf( !isDev, cleancss()) )
        .pipe(rename({
            suffix : '.min'
        }))
        .pipe(gulp.dest(paths.build.style))
        .pipe(reload({stream: true}));       
});

gulp.task('js:build', function () { // js
    return gulp.src(paths.input.js, {since: gulp.lastRun(tasks['js'])})
        .pipe(plumber({
            errorHandler : notify.onError(function (err) {
                return {
                    title: 'JS',
                    message: err.message
                }
            })
        }))
        .pipe( gulpIf(isDev, sourcemaps.init()) )
        .pipe(rigger())
        .pipe(gulpIf( isDev, sourcemaps.write()) )
        .pipe(gulpIf( !isDev, uglify() ) )
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.build.js))
        .pipe( reload({stream: true}) );       
});

gulp.task('fonts:build', function() { // fonts
    return gulp.src(paths.input.fonts)
        .pipe(plumber({
            errorHandler : notify.onError(function (err) {
                return {
                    title: 'FONTS',
                    message: err.message
                }
            })
        }))
        .pipe(gulp.dest(paths.build.fonts));
});

gulp.task('images:build', function () { // images
    return gulp.src(paths.input.images, {base: './'})
        .pipe(plumber({
            errorHandler : notify.onError(function (err) {
                return {
                    title: 'IMAGES',
                    message: err.message
                }
            })
        }))
        .pipe(newer(paths.build.images)) // note the path is identical to gulp.dest(path)
        .pipe(imagemin())
        .pipe(gulp.dest(paths.build.images))
        .pipe(reload({stream: true}))
});

gulp.task('vendors:build', function () { // vendors
    return gulp.src(paths.input.vendors)
        .pipe(plumber({
            errorHandler : notify.onError(function (err) {
                return {
                    title: 'VENDORS',
                    message: err.message
                }
            })
        }))
        .pipe(newer(paths.build.images)) // note the path is identical to gulp.dest(path)
        .pipe(gulp.dest(paths.build.vendors))
        .pipe(reload({stream: true}))
});


gulp.task('build', gulp.parallel([ // include all tasks above
    tasks.html, tasks.style, tasks.js, tasks.fonts, tasks.images, tasks.vendors
]) );

gulp.task('webserver', function () { // create server
    browserSync.init({
        server: {
            baseDir: "../html/assets/"
        }
    });
});

gulp.task('clean', function() {
    return del('../html', {force:true});
});

gulp.task('watch', function() { // watch
    gulp.watch(paths.input.html, gulp.parallel(tasks.html));
    gulp.watch(paths.input.style, gulp.parallel(tasks.style));
    gulp.watch(paths.input.js, gulp.parallel(tasks.js));
    gulp.watch(paths.input.fonts, gulp.parallel(tasks.fonts));
    gulp.watch(paths.input.images, gulp.parallel(tasks.images));
    gulp.watch(paths.input.vendors, gulp.parallel(tasks.vendors));

});
// 
// Run the gulp configuration in this one as default
gulp.task('default', gulp.parallel('build', gulp.parallel( ['webserver', 'watch'] )) );
