'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const rename = require("gulp-rename");
const gcmq = require('gulp-group-css-media-queries');
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require('browser-sync').create();
const ssi = require('browsersync-ssi');
var builDssi = require("gulp-ssi");
const autoprefixer = require('gulp-autoprefixer');
sass.compiler = require('node-sass');
const webpack = require('webpack-stream');
const del = require('del');
const imagemin = require('gulp-imagemin');
const debug = require('gulp-debug');
const plumber = require('gulp-plumber');

gulp.task('img', function (){
  return gulp.src('./app/assets/img/**/*.{jpg,png,svg,gif,ico,webp,JPG,PNG,SVG,GIF,ICO,WEBP}')
  .pipe(debug({title: 'building img:', showFiles: true}))
  .pipe(plumber())
  .pipe(imagemin(
    [
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
    ]
  ))
  .pipe(gulp.dest('./dist/assets/img'))
  .pipe(browserSync.stream())
});

gulp.task('sass', function (){
    return gulp.src('./app/assets/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        cascade: false
    }))
    .pipe(gcmq())
    .pipe(csso())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./app/assets/css'))
    .pipe(browserSync.reload({ stream: true }))
});

gulp.task('js', function (){
    return gulp.src(['./app/assets/js/*.js', '!app/assets/js/*.min.js'])
		.pipe(webpack({
			mode: 'production',
			performance: { hints: false },
			module: {
				rules: [
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader',
						query: {
							presets: ['@babel/env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				]
			}
		})).on('error', function handleError() {
			this.emit('end')
		})
		.pipe(rename('script.min.js'))
		.pipe(gulp.dest('./app/assets/js/'))
		.pipe(browserSync.stream())
});

gulp.task('html', function (){
    return gulp.src('./app/*.html')
    .pipe(builDssi({root:'./app'}))
    .pipe(gulp.dest('./dist/'))
});


gulp.task('clean', async function() {
  return del.sync('./dist')

});

gulp.task('prebuild', async function() {
  let buildCss = gulp.src('./app/assets/css/*.css').pipe(gulp.dest('./dist/assets/css'));

  let buildFonts = gulp.src('./app/assets/fonts/**/*').pipe(gulp.dest('./dist/assets/fonts'));

  let buildJs =  gulp.src('./app/assets/js/*.min.js').pipe(gulp.dest('./dist/assets/js'));
});

gulp.task('serve', function() {
    browserSync.init({
      server: {
        baseDir: 'app/',
        middleware: ssi({ baseDir: 'app/', ext: '.html' })
      },
      notify: false, 
      online: true
    }, 
    );

    gulp.watch('./app/assets/scss/**/*.scss', gulp.parallel('sass'));
    gulp.watch('./app/*.html').on('change', browserSync.reload);
    gulp.watch('./app/img/**/*.{jpg,jpeg,png,webp,svg,gif}').on('change', browserSync.reload);
    gulp.watch(['./app/assets/js/*.js', '!app/assets/js/*.min.js'], gulp.parallel('js'));
    gulp.watch('./app/view/**/*.html').on('change', browserSync.reload);;
});


gulp.task('dev', gulp.parallel('sass', 'js', 'serve'));

gulp.task('build', gulp.series('clean', gulp.parallel('html' ,'sass', 'js', 'img'), 'prebuild'));